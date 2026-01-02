const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const archiver = require('archiver');
const { createWriteStream, createReadStream, existsSync } = require('fs');
const fs = require('fs-extra');
const path = require('path');

module.exports = (dependencies) => {
    const { LABS_DIR, broadcastLog, broadcastState, io } = dependencies;
    const BackupEngine = require('../services/BackupEngine');
    const jobManager = require('../services/JobManager');
    const os = require('os');

    // Initialize JobManager on module load
    jobManager.init();

    // Configure S3 Client for Vultr

    // Configure S3 Client for Vultr
    const s3 = new AWS.S3({
        endpoint: `https://${process.env.VULTR_ENDPOINT || 'ewr1.vultrobjects.com'}`,
        accessKeyId: process.env.VULTR_ACCESS_KEY,
        secretAccessKey: process.env.VULTR_SECRET_KEY,
        s3ForcePathStyle: true,
        signatureVersion: 'v4'
    });

    const BUCKET_NAME = process.env.VULTR_BUCKET_NAME || 'lab-backups';

    // Helper: Create ZIP
    async function createZipArchive(versionId, outputPath) {
        return new Promise((resolve, reject) => {
            const sourcePath = path.join(LABS_DIR, versionId);

            if (!existsSync(sourcePath)) {
                return reject(new Error(`Directory not found: ${sourcePath}`));
            }

            const output = createWriteStream(outputPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => resolve(archive.pointer()));
            archive.on('error', reject);

            archive.pipe(output);
            archive.directory(sourcePath, versionId);
            archive.finalize();
        });
    }

    // GET /status - Check S3 and auto-create bucket
    router.get('/status', async (req, res) => {
        try {
            try {
                await s3.headBucket({ Bucket: BUCKET_NAME }).promise();

                res.json({
                    connected: true,
                    bucket: BUCKET_NAME,
                    endpoint: process.env.VULTR_ENDPOINT,
                    autoCreated: false
                });
            } catch (headErr) {
                if (headErr.code === 'NotFound' || headErr.statusCode === 404) {
                    broadcastLog('system', `Bucket ${BUCKET_NAME} not found. Creating...`, 'warn');

                    await s3.createBucket({ Bucket: BUCKET_NAME }).promise();
                    broadcastLog('system', `✅ Bucket ${BUCKET_NAME} created`, 'success');

                    res.json({
                        connected: true,
                        bucket: BUCKET_NAME,
                        endpoint: process.env.VULTR_ENDPOINT,
                        autoCreated: true
                    });
                } else {
                    throw headErr;
                }
            }
        } catch (err) {
            console.error('S3 Connection Error:', err);
            res.json({
                connected: false,
                error: err.message,
                code: err.code
            });
        }
    });

    // POST /backup/:versionId
    router.post('/backup/:versionId', async (req, res) => {
        const { versionId } = req.params;
        const tempZipPath = path.join(LABS_DIR, `_temp_${versionId}_${Date.now()}.zip`);

        try {
            broadcastLog('system', `Creating backup of ${versionId}...`, 'info');

            const zipSize = await createZipArchive(versionId, tempZipPath);
            broadcastLog('system', `ZIP created (${(zipSize / 1024 / 1024).toFixed(2)} MB)`, 'success');

            const s3Key = `lab-backups/${versionId}/${Date.now()}.zip`;
            const fileStream = createReadStream(tempZipPath);

            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: fileStream,
                ContentType: 'application/zip',
                Metadata: {
                    versionId: versionId,
                    uploadDate: new Date().toISOString(),
                    size: zipSize.toString()
                }
            };

            broadcastLog('system', `Uploading to S3...`, 'info');
            const s3Result = await s3.upload(uploadParams).promise();

            fs.unlinkSync(tempZipPath);

            broadcastLog('system', `✅ Backup uploaded: ${s3Key}`, 'success');

            res.json({
                success: true,
                backupId: s3Key,
                url: s3Result.Location,
                size: zipSize,
                etag: s3Result.ETag
            });

        } catch (err) {
            console.error('Backup error:', err);
            broadcastLog('system', `❌ Backup failed: ${err.message}`, 'error');

            if (existsSync(tempZipPath)) {
                fs.unlinkSync(tempZipPath);
            }

            res.status(500).json({ error: err.message });
        }
    });

    // ========== CACHE SYSTEM FOR S3 LISTING ==========
    let filesCache = {
        data: null,
        timestamp: 0,
        loading: false,
        loadPromise: null,
        loadedFolders: new Set() // Track which folders have been fully loaded
    };
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

    // Start loading in background (non-blocking)
    function startBackgroundLoad() {
        if (filesCache.loading || (filesCache.data && (Date.now() - filesCache.timestamp) < CACHE_TTL_MS)) {
            return; // Already loading or cache is fresh
        }

        filesCache.loading = true;
        filesCache.loadPromise = loadAllFilesFromS3()
            .then(data => {
                filesCache.data = data;
                filesCache.timestamp = Date.now();
                filesCache.loading = false;
                filesCache.loadPromise = null;
                // Emit via socket that full cache is ready
                if (dependencies.io) {
                    dependencies.io.emit('cache:ready', { totalFiles: data.length });
                }
                return data;
            })
            .catch(err => {
                filesCache.loading = false;
                filesCache.loadPromise = null;
                console.error('[S3Cache] Background load failed:', err);
            });
    }

    async function loadAllFilesFromS3() {
        console.log('[S3Cache] Starting full bucket scan...');
        const startTime = Date.now();
        let allContents = [];
        let continuationToken = null;

        do {
            const params = {
                Bucket: BUCKET_NAME,
                MaxKeys: 1000 // S3 max per request
            };
            if (continuationToken) {
                params.ContinuationToken = continuationToken;
            }

            const data = await s3.listObjectsV2(params).promise();

            if (data.Contents) {
                allContents = allContents.concat(data.Contents.map(item => ({
                    key: item.Key,
                    size: item.Size,
                    lastModified: item.LastModified,
                    versionId: item.Key.split('/').length > 1 ? item.Key.split('/')[1] : 'root',
                    etag: item.ETag
                })));
            }

            continuationToken = data.IsTruncated ? data.NextContinuationToken : null;
            console.log(`[S3Cache] Loaded ${allContents.length} files so far...`);
        } while (continuationToken);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[S3Cache] Complete! Loaded ${allContents.length} files in ${elapsed}s`);

        return allContents;
    }

    async function getCachedFiles(forceRefresh = false) {
        const now = Date.now();

        // Return cached data if valid
        if (!forceRefresh && filesCache.data && (now - filesCache.timestamp) < CACHE_TTL_MS) {
            console.log(`[S3Cache] Cache hit! ${filesCache.data.length} files (age: ${((now - filesCache.timestamp) / 1000).toFixed(0)}s)`);
            return filesCache.data;
        }

        // If already loading, wait for that load to complete
        if (filesCache.loading && filesCache.loadPromise) {
            console.log('[S3Cache] Another request is loading, waiting...');
            return await filesCache.loadPromise;
        }

        // Start loading
        filesCache.loading = true;
        filesCache.loadPromise = loadAllFilesFromS3()
            .then(data => {
                filesCache.data = data;
                filesCache.timestamp = Date.now();
                filesCache.loading = false;
                filesCache.loadPromise = null;
                return data;
            })
            .catch(err => {
                filesCache.loading = false;
                filesCache.loadPromise = null;
                throw err;
            });

        return await filesCache.loadPromise;
    }

    // GET /list/tree - FAST: List only one level at a time using S3 Delimiter
    // This returns folders and files at a specific prefix level INSTANTLY
    router.get('/list/tree', async (req, res) => {
        try {
            const prefix = req.query.prefix || '';

            console.log(`[S3Tree] Listing level: "${prefix || 'ROOT'}"`);

            const params = {
                Bucket: BUCKET_NAME,
                Prefix: prefix,
                Delimiter: '/', // This is the magic - only returns one level
                MaxKeys: 1000
            };

            const data = await s3.listObjectsV2(params).promise();

            // Folders at this level (CommonPrefixes)
            const folders = (data.CommonPrefixes || []).map(cp => ({
                key: cp.Prefix,
                name: cp.Prefix.replace(prefix, '').replace(/\/$/, ''),
                type: 'folder',
                isLoading: !filesCache.data // If full cache not ready, folder contents are "loading"
            }));

            // Files at this level (Contents, excluding the prefix itself)
            const files = (data.Contents || [])
                .filter(item => item.Key !== prefix) // Exclude the folder itself
                .map(item => ({
                    key: item.Key,
                    name: item.Key.replace(prefix, ''),
                    size: item.Size,
                    lastModified: item.LastModified,
                    type: 'file',
                    etag: item.ETag
                }));

            // Start background full load if not already done
            startBackgroundLoad();

            res.json({
                prefix,
                folders,
                files,
                isTruncated: data.IsTruncated,
                cacheStatus: {
                    isLoading: filesCache.loading,
                    isReady: !!filesCache.data,
                    totalFiles: filesCache.data ? filesCache.data.length : null
                }
            });

        } catch (err) {
            console.error('Tree list error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // GET /cache/status - Check if background cache is ready
    router.get('/cache/status', (req, res) => {
        res.json({
            isLoading: filesCache.loading,
            isReady: !!filesCache.data,
            totalFiles: filesCache.data ? filesCache.data.length : 0,
            age: filesCache.timestamp > 0 ? Math.round((Date.now() - filesCache.timestamp) / 1000) : null,
            ttl: Math.round(CACHE_TTL_MS / 1000)
        });
    });

    // GET /list - Now with cache and full pagination
    router.get('/list', async (req, res) => {
        try {
            const forceRefresh = req.query.refresh === 'true';
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 100;

            const allFiles = await getCachedFiles(forceRefresh);

            // Optional: filter by prefix
            let filteredFiles = allFiles;
            if (req.query.prefix) {
                filteredFiles = allFiles.filter(f => f.key.startsWith(req.query.prefix));
            }

            // Pagination for response
            const totalItems = filteredFiles.length;
            const totalPages = Math.ceil(totalItems / pageSize);
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

            res.json({
                files: paginatedFiles,
                pagination: {
                    page,
                    pageSize,
                    totalItems,
                    totalPages,
                    hasMore: page < totalPages
                },
                cache: {
                    age: filesCache.timestamp > 0 ? Math.round((Date.now() - filesCache.timestamp) / 1000) : 0,
                    ttl: Math.round(CACHE_TTL_MS / 1000)
                }
            });

        } catch (err) {
            console.error('List error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // GET /list/:versionId
    router.get('/list/:versionId', async (req, res) => {
        const { versionId } = req.params;

        try {
            const params = {
                Bucket: BUCKET_NAME,
                Prefix: `lab-backups/${versionId}/`
            };

            const data = await s3.listObjectsV2(params).promise();

            const backups = (data.Contents || []).map(item => ({
                key: item.Key,
                size: item.Size,
                lastModified: item.LastModified,
                etag: item.ETag
            }));

            res.json(backups);

        } catch (err) {
            console.error('List error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // POST /restore
    router.post('/restore', async (req, res) => {
        const { backupKey, targetName } = req.body;

        if (!backupKey) {
            return res.status(400).json({ error: 'Backup key required' });
        }

        const tempZipPath = path.join(LABS_DIR, `_restore_${Date.now()}.zip`);
        const targetPath = path.join(LABS_DIR, targetName || path.basename(backupKey, '.zip'));

        try {
            broadcastLog('system', `Downloading backup from S3...`, 'info');

            const params = { Bucket: BUCKET_NAME, Key: backupKey };
            const s3Stream = s3.getObject(params).createReadStream();
            const fileStream = createWriteStream(tempZipPath);

            await new Promise((resolve, reject) => {
                s3Stream.pipe(fileStream);
                fileStream.on('close', resolve);
                s3Stream.on('error', reject);
            });

            broadcastLog('system', `Extracting backup...`, 'info');

            const AdmZip = require('adm-zip');
            const zip = new AdmZip(tempZipPath);
            zip.extractAllTo(targetPath, true);

            fs.unlinkSync(tempZipPath);

            broadcastLog('system', `✅ Backup restored to ${targetName}`, 'success');
            broadcastState();

            res.json({ success: true, path: targetPath });

        } catch (err) {
            console.error('Restore error:', err);
            broadcastLog('system', `❌ Restore failed: ${err.message}`, 'error');

            if (existsSync(tempZipPath)) {
                fs.unlinkSync(tempZipPath);
            }

            res.status(500).json({ error: err.message });
        }
    });

    // DELETE /delete
    router.delete('/delete', async (req, res) => {
        const { backupKey } = req.body;

        if (!backupKey) {
            return res.status(400).json({ error: 'Backup key required' });
        }

        try {
            const params = { Bucket: BUCKET_NAME, Key: backupKey };
            await s3.deleteObject(params).promise();

            broadcastLog('system', `🗑️ Backup deleted: ${backupKey}`, 'warn');

            res.json({ success: true });

        } catch (err) {
            console.error('Delete error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // POST /upload - Upload file from PC directly to S3
    router.post('/upload', dependencies.multer().single('file'), async (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        try {
            const s3Key = `lab-backups/uploads/${Date.now()}_${req.file.originalname}`;

            // Upload to S3
            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: req.file.buffer, // Buffer from multer memory storage
                ContentType: req.file.mimetype,
                Metadata: {
                    originalName: req.file.originalname,
                    uploadDate: new Date().toISOString()
                }
            };

            dependencies.broadcastLog('system', `☁️ Uploading ${req.file.originalname} to Cloud...`, 'info');
            const s3Result = await s3.upload(uploadParams).promise();

            dependencies.broadcastLog('system', `✅ Cloud upload complete: ${req.file.originalname}`, 'success');

            res.json({
                success: true,
                key: s3Key,
                url: s3Result.Location,
                size: req.file.size
            });
        } catch (err) {
            console.error('Cloud upload error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // POST /import - Import Web Project from S3 to Workspace
    router.post('/import', async (req, res) => {
        const { key } = req.body;
        if (!key) return res.status(400).json({ error: 'Key required' });

        const fileName = path.basename(key, '.zip');
        const tempPath = path.join(LABS_DIR, `_import_${Date.now()}.zip`);

        // If it's the "uploads" folder, we might want to just dump it cleanly
        // If it's a version backup, it extracts to versionId
        // Let's assume standard unzip to a new folder named after the file
        const targetPath = path.join(LABS_DIR, fileName);

        try {
            dependencies.broadcastLog('system', `⬇️ Importing ${key} from Cloud...`, 'info');

            const params = { Bucket: BUCKET_NAME, Key: key };
            const s3Stream = s3.getObject(params).createReadStream();
            const fileStream = createWriteStream(tempPath);

            await new Promise((resolve, reject) => {
                s3Stream.pipe(fileStream);
                fileStream.on('close', resolve);
                s3Stream.on('error', reject);
            });

            dependencies.broadcastLog('system', `📦 Extracting to ${fileName}...`, 'info');

            const AdmZip = require('adm-zip');
            const zip = new AdmZip(tempPath);
            zip.extractAllTo(targetPath, true);

            fs.unlinkSync(tempPath);
            dependencies.broadcastLog('system', `✅ Project imported successfully: ${fileName}`, 'success');

            // Notify frontend to refresh versions list
            dependencies.broadcastState();

            res.json({ success: true, versionId: fileName });

        } catch (err) {
            console.error('Import error:', err);
            dependencies.broadcastLog('system', `❌ Import failed: ${err.message}`, 'error');
            if (existsSync(tempPath)) fs.unlinkSync(tempPath);
            res.status(500).json({ error: err.message });
        }
    });

    // POST /transfer - Upload a local server-side file to Cloud (S3)
    // Used for System Backup (uploading files from C:/ directly)
    // Enhanced to support Directory Uploads (via Zip)
    // POST /transfer - Upload a local server-side file to Cloud (S3)
    // Used for System Backup (uploading files from C:/ directly)
    // Enhanced to support Directory Uploads (via Zip) AND VSS Snapshots (via readPath)
    router.post('/transfer', async (req, res) => {
        const { sourcePath, targetPath, readPath } = req.body;
        const actualPath = readPath || sourcePath;

        if (!actualPath || !fs.existsSync(actualPath)) {
            return res.status(400).json({ error: 'Valid source path required' });
        }

        try {
            const stats = fs.statSync(actualPath);
            const isDirectory = stats.isDirectory();
            const fileName = path.basename(sourcePath || actualPath); // Keep original name if possible

            let s3Key, fileStream, uploadSize, contentType;

            if (isDirectory) {
                // Directory: Zip it first
                const tempZipPath = path.join(LABS_DIR, `_transfer_${Date.now()}.zip`);
                dependencies.broadcastLog('system', `📦 Zipping folder: ${fileName}...`, 'info');

                await new Promise((resolve, reject) => {
                    const output = createWriteStream(tempZipPath);
                    const archive = archiver('zip', { zlib: { level: 9 } });
                    output.on('close', resolve);
                    archive.on('error', reject);
                    archive.pipe(output);
                    archive.directory(actualPath, fileName); // Read from Shadow Path, store as "fileName"
                    archive.finalize();
                });

                uploadSize = fs.statSync(tempZipPath).size;
                fileStream = createReadStream(tempZipPath);
                s3Key = targetPath || `system-backups/${os.hostname()}/${fileName}.zip`;
                contentType = 'application/zip';

                dependencies.broadcastLog('system', `📦 Zip complete (${(uploadSize / 1024 / 1024).toFixed(2)} MB). Uploading...`, 'info');

            } else {
                // File: Upload directly
                s3Key = targetPath || `system-backups/${os.hostname()}/${Date.now()}_${fileName}`;
                fileStream = fs.createReadStream(actualPath); // Read from Shadow or Real path
                uploadSize = stats.size;
                contentType = 'application/octet-stream';
            }

            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: fileStream,
                ContentType: contentType,
                Metadata: {
                    originalPath: sourcePath, // Keep record of C:\ path
                    backupDate: new Date().toISOString(),
                    type: isDirectory ? 'directory-zip' : 'file',
                    mode: readPath ? 'vss-snapshot' : 'standard'
                }
            };

            if (!isDirectory) dependencies.broadcastLog('system', `🚀 Starting Server-Side Upload: ${fileName}...`, 'info');

            const s3Result = await s3.upload(uploadParams).promise();

            if (isDirectory) {
                // Cleanup temp zip
                fs.readdirSync(LABS_DIR).filter(f => f.startsWith('_transfer_') && f.endsWith('.zip'))
                    .forEach(f => { try { fs.unlinkSync(path.join(LABS_DIR, f)); } catch (e) { } });
            }

            dependencies.broadcastLog('system', `✅ Server-Side Upload Complete: ${fileName}`, 'success');

            res.json({
                success: true,
                key: s3Key,
                size: uploadSize
            });

        } catch (err) {
            console.error('Transfer error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    const { v4: uuidv4 } = require('uuid');
    const activeJobs = new Map(); // Store active BackupEngine instances

    // POST /mirror - Start Full Drive/Recursive Backup
    router.post('/mirror', async (req, res) => {
        const { sourcePath, snapshotMode } = req.body;

        if (!sourcePath) return res.status(400).json({ error: 'Source path required' });

        const hostname = os.hostname();
        // Extract drive letter or folder name for structured path
        // If snapshot, we assume C drive for now, or we can parse the sourcePath if it looks like a standard path
        let targetPrefix;

        if (snapshotMode) {
            targetPrefix = `backups/${hostname}/C_DRIVE`;
        } else {
            // Normal folder mirror: Keep structure relative to parent? Or just folder name?
            // User wants structure. If selecting C:\Users\Admin, user probably expects backups/HOSTNAME/Users/Admin
            // Let's try to preserve path relative to drive root
            const match = sourcePath.match(/^([a-zA-Z]:)(.*)/);
            if (match) {
                const drive = match[1].replace(':', '');
                const rest = match[2]; // \Users\Admin...
                targetPrefix = `backups/${hostname}/${drive}_DRIVE${rest}`.replace(/\\/g, '/');
            } else {
                // Fallback
                const folderName = path.basename(sourcePath);
                targetPrefix = `backups/${hostname}/${folderName}`;
            }
        }

        // Remove trailing slash from prefix if present
        if (targetPrefix.endsWith('/')) targetPrefix = targetPrefix.slice(0, -1);

        const jobId = uuidv4();

        try {
            dependencies.broadcastLog('system', `🚀 Starting Mirror Job [${jobId}]... Target: ${targetPrefix}`, 'info');

            const engine = new BackupEngine(s3, BUCKET_NAME, dependencies, jobId);
            activeJobs.set(jobId, engine);

            // Hook events to Socket
            engine.on('progress', (stats) => {
                // frontend expects { jobId, ...stats }
                dependencies.io.emit('backup:progress', stats);
            });

            engine.on('complete', (stats) => {
                dependencies.broadcastLog('system', `✅ Job [${jobId.slice(0, 8)}] Complete! ${stats.filesUploaded} files.`, 'success');
                dependencies.io.emit('backup:complete', stats);
                activeJobs.delete(jobId);
            });

            engine.on('error', (err) => {
                dependencies.broadcastLog('system', `❌ Job [${jobId.slice(0, 8)}] Error: ${err.message}`, 'error');
                dependencies.io.emit('backup:error', { jobId, error: err.message });
                activeJobs.delete(jobId);
            });

            // Real-time file list updates
            engine.on('fileUploaded', (fileInfo) => {
                dependencies.io.emit('file:uploaded', fileInfo);
            });

            // Persist job state periodically
            engine.on('stateSave', async (stateData) => {
                await jobManager.updateProgress(stateData.jobId, stateData.progress, stateData.uploadedKeys);
            });

            // Save initial job state
            await jobManager.saveJob({
                jobId: jobId,
                sourcePath: sourcePath,
                targetPrefix: targetPrefix,
                snapshotMode: snapshotMode,
                status: 'running',
                progress: { filesScanned: 0, filesUploaded: 0, bytesUploaded: 0, errors: 0 },
                uploadedKeys: []
            });

            // Handle job completion - remove from persistence
            engine.on('complete', async (stats) => {
                await jobManager.markCompleted(jobId);
            });

            engine.on('error', async (err) => {
                await jobManager.markInterrupted(jobId);
            });

            // Start async
            engine.startBackup(sourcePath, targetPrefix);

            res.json({
                success: true,
                jobId: jobId,
                message: 'Backup started in background',
                target: targetPrefix
            });

        } catch (err) {
            console.error('Mirror start error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // POST /job/cancel - Stop and optionally cleanup
    router.post('/job/cancel', async (req, res) => {
        const { jobId, clean } = req.body;

        if (!activeJobs.has(jobId)) {
            return res.status(404).json({ error: 'Job not found or already finished' });
        }

        const engine = activeJobs.get(jobId);

        try {
            engine.stop();
            dependencies.broadcastLog('system', `🛑 Stopping Job [${jobId.slice(0, 8)}]...`, 'warn');

            if (clean) {
                dependencies.broadcastLog('system', `🧹 Cleaning up uploaded files for Job [${jobId.slice(0, 8)}]...`, 'warn');
                await engine.cleanup();
            }

            activeJobs.delete(jobId);
            dependencies.io.emit('backup:canceled', { jobId });

            res.json({ success: true, cleaned: !!clean });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // POST /jobs/stop-all - Stop all active jobs and optionally clean
    router.post('/jobs/stop-all', async (req, res) => {
        const { clean } = req.body;
        const stoppedJobs = [];

        try {
            for (const [jobId, engine] of activeJobs.entries()) {
                engine.stop();
                if (clean) {
                    await engine.cleanup();
                }
                stoppedJobs.push(jobId);
                dependencies.io.emit('backup:canceled', { jobId });
            }
            activeJobs.clear();
            dependencies.broadcastLog('system', `🛑 Stopped ${stoppedJobs.length} active jobs.`, 'warn');
            res.json({ success: true, stoppedCount: stoppedJobs.length, cleaned: !!clean });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // POST /purge - Delete ALL objects from the bucket (DANGER)
    router.post('/purge', async (req, res) => {
        try {
            dependencies.broadcastLog('system', '🚨 PURGE: Starting complete bucket cleanup...', 'error');

            // List all objects
            let allKeys = [];
            let continuationToken = null;

            do {
                const params = {
                    Bucket: BUCKET_NAME
                };
                if (continuationToken) params.ContinuationToken = continuationToken;

                const listResult = await s3.listObjectsV2(params).promise();
                if (listResult.Contents) {
                    allKeys = allKeys.concat(listResult.Contents.map(o => ({ Key: o.Key })));
                }
                continuationToken = listResult.IsTruncated ? listResult.NextContinuationToken : null;
            } while (continuationToken);

            if (allKeys.length === 0) {
                dependencies.broadcastLog('system', '✅ PURGE: Bucket is already empty.', 'info');
                return res.json({ success: true, deletedCount: 0 });
            }

            // Delete in batches of 1000 (S3 limit)
            const batchSize = 1000;
            let deletedCount = 0;

            for (let i = 0; i < allKeys.length; i += batchSize) {
                const batch = allKeys.slice(i, i + batchSize);
                await s3.deleteObjects({
                    Bucket: BUCKET_NAME,
                    Delete: { Objects: batch }
                }).promise();
                deletedCount += batch.length;
                dependencies.broadcastLog('system', `🧹 PURGE: Deleted ${deletedCount}/${allKeys.length} objects...`, 'warn');
            }

            dependencies.broadcastLog('system', `✅ PURGE COMPLETE: Deleted ${deletedCount} objects.`, 'info');
            res.json({ success: true, deletedCount });
        } catch (err) {
            console.error('Purge error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // GET /jobs/pending - List interrupted/resumable jobs
    router.get('/jobs/pending', async (req, res) => {
        try {
            const pending = jobManager.getPendingJobs();
            res.json(pending);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // POST /jobs/resume - Resume a previously interrupted job
    router.post('/jobs/resume', async (req, res) => {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ error: 'jobId is required' });
        }

        const savedJob = jobManager.getJob(jobId);
        if (!savedJob) {
            return res.status(404).json({ error: 'Job not found' });
        }

        try {
            dependencies.broadcastLog('system', `🔄 Resuming Job [${jobId.slice(0, 8)}]... ${savedJob.uploadedKeys.length} files already uploaded.`, 'info');

            // Create new engine with already uploaded keys for resume
            const engine = new BackupEngine(s3, BUCKET_NAME, dependencies, jobId, savedJob.uploadedKeys);
            activeJobs.set(jobId, engine);

            // Hook events
            engine.on('progress', (stats) => {
                dependencies.io.emit('backup:progress', stats);
            });

            engine.on('complete', async (stats) => {
                dependencies.broadcastLog('system', `✅ Resumed Job [${jobId.slice(0, 8)}] Complete! ${stats.filesUploaded} files.`, 'success');
                dependencies.io.emit('backup:complete', stats);
                activeJobs.delete(jobId);
                await jobManager.markCompleted(jobId);
            });

            engine.on('error', async (err) => {
                dependencies.broadcastLog('system', `❌ Resumed Job [${jobId.slice(0, 8)}] Error: ${err.message}`, 'error');
                dependencies.io.emit('backup:error', { jobId, error: err.message });
                activeJobs.delete(jobId);
                await jobManager.markInterrupted(jobId);
            });

            engine.on('fileUploaded', (fileInfo) => {
                dependencies.io.emit('file:uploaded', fileInfo);
            });

            engine.on('stateSave', async (stateData) => {
                await jobManager.updateProgress(stateData.jobId, stateData.progress, stateData.uploadedKeys);
            });

            // Update job status to running
            await jobManager.saveJob({ ...savedJob, status: 'running' });

            // Start from saved source/target
            engine.startBackup(savedJob.sourcePath, savedJob.targetPrefix);

            res.json({
                success: true,
                jobId: jobId,
                message: 'Job resumed',
                alreadyUploaded: savedJob.uploadedKeys.length
            });

        } catch (err) {
            console.error('Resume error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // DELETE /jobs/:id - Abandon a pending job
    router.delete('/jobs/:id', async (req, res) => {
        const { id } = req.params;
        try {
            await jobManager.deleteJob(id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
