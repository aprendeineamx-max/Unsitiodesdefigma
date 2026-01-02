const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const { createWriteStream, createReadStream, existsSync } = require('fs');
const os = require('os');

// Import Services
const S3Service = require('../services/S3Service');
const CloudCache = require('../services/CloudCache');
const JobService = require('../services/JobService');

module.exports = (dependencies) => {
    const { LABS_DIR, broadcastLog, broadcastState } = dependencies;

    // Initialize Services with dependencies
    CloudCache.init(dependencies);
    JobService.init(dependencies);

    // --- STATUS CHECK ---
    router.get('/status', async (req, res) => {
        try {
            const status = await S3Service.ensureBucket();
            if (status.created) {
                broadcastLog('system', `✅ Bucket ${S3Service.bucketName} created`, 'success');
            }
            res.json({
                connected: true,
                bucket: S3Service.bucketName,
                endpoint: S3Service.endpoint,
                autoCreated: status.created
            });
        } catch (err) {
            console.error('S3 Connect Error:', err);
            res.json({ connected: false, error: err.message });
        }
    });

    // --- CACHE & LISTING ---
    router.get('/cache/status', (req, res) => {
        res.json(CloudCache.getStatus());
    });

    router.get('/list/tree', async (req, res) => {
        try {
            const prefix = req.query.prefix || '';
            console.log(`[S3Tree] Listing level: "${prefix || 'ROOT'}"`);

            const data = await S3Service.listObjects(prefix, '/');

            // Map Folders
            const folders = (data.CommonPrefixes || []).map(cp => {
                const folderKey = cp.Prefix;
                const stats = CloudCache.getFolderStats(folderKey);
                return {
                    key: folderKey,
                    name: folderKey.replace(prefix, '').replace(/\/$/, ''),
                    type: 'folder',
                    ...stats,
                    isLoading: CloudCache.cache.loading && !stats.isComplete
                };
            });

            // Map Files
            const files = (data.Contents || [])
                .filter(item => item.Key !== prefix)
                .map(item => ({
                    key: item.Key,
                    name: item.Key.replace(prefix, ''),
                    size: item.Size,
                    lastModified: item.LastModified,
                    type: 'file',
                    etag: item.ETag
                }));

            // Trigger background load
            CloudCache.startBackgroundLoad();

            res.json({
                prefix,
                folders,
                files,
                cacheStatus: CloudCache.getStatus()
            });

        } catch (err) {
            console.error('Tree list error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // --- FILE PREVIEW (NEW) ---
    router.get('/preview/:key(*)', async (req, res) => {
        try {
            const key = req.params.key;
            if (!key) return res.status(400).json({ error: 'Key required' });

            const url = await S3Service.getSignedUrl(key);
            res.json({ url });
        } catch (err) {
            console.error('Preview error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // --- UPLOAD & BACKUP ---
    router.post('/upload', dependencies.multer().single('file'), async (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        try {
            const s3Key = `lab-backups/uploads/${Date.now()}_${req.file.originalname}`;
            broadcastLog('system', `☁️ Uploading ${req.file.originalname}...`, 'info');

            const result = await S3Service.uploadBuffer(s3Key, req.file.buffer, req.file.mimetype, {
                originalName: req.file.originalname,
                uploadDate: new Date().toISOString()
            });

            broadcastLog('system', `✅ Upload complete: ${req.file.originalname}`, 'success');
            res.json({ success: true, key: s3Key, url: result.Location, size: req.file.size });

            // Refresh cache implicitly by just logging (or we could trigger refresh)
        } catch (err) {
            console.error('Upload error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // --- JOBS & MIRROR ---
    router.post('/mirror', async (req, res) => {
        try {
            const { sourcePath, snapshotMode } = req.body;
            broadcastLog('system', `🚀 Starting Mirror Job...`, 'info');

            const result = await JobService.createMirrorJob(sourcePath, snapshotMode);
            res.json({ success: true, message: 'Job started', ...result });
        } catch (err) {
            console.error('Mirror error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    router.get('/jobs/pending', async (req, res) => {
        res.json(JobService.getPendingJobs());
    });

    router.post('/jobs/resume', async (req, res) => {
        try {
            const result = await JobService.resumeJob(req.body.jobId);
            res.json({ success: true, message: 'Resumed', ...result });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/job/cancel', async (req, res) => {
        try {
            await JobService.cancelJob(req.body.jobId, req.body.clean);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- LEGACY/MISC ROUTES ---
    // (Kept simple, logic in S3Service mostly)

    router.post('/delete', async (req, res) => {
        try {
            await S3Service.deleteObject(req.body.key);
            broadcastLog('system', `🗑️ Deleted: ${req.body.key}`, 'warn');
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/purge', async (req, res) => {
        try {
            broadcastLog('system', '🚨 Starting Bucket PURGE...', 'error');
            // Quick implementation via S3Service loop
            let deletedCount = 0;
            let continuator = null;
            do {
                const list = await S3Service.listObjects('', null, 1000); // flat list
                if (list.Contents && list.Contents.length > 0) {
                    const keys = list.Contents.map(k => k.Key);
                    await S3Service.deleteObjects(keys);
                    deletedCount += keys.length;
                    broadcastLog('system', `Deleted ${deletedCount} objects...`, 'warn');
                }
                continuator = list.IsTruncated ? list.NextContinuationToken : null;
            } while (continuator);

            broadcastLog('system', `✅ Purge complete.`, 'success');
            res.json({ success: true, deletedCount });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // --- TRANSFER (Server-side upload) ---
    // Keeping this logic here for now or could move to Service, but it does local FS ops + Zip
    router.post('/transfer', async (req, res) => {
        const { sourcePath, targetPath, readPath } = req.body;
        const actualPath = readPath || sourcePath;

        if (!actualPath || !fs.existsSync(actualPath)) return res.status(400).json({ error: 'Invalid path' });

        try {
            const stats = fs.statSync(actualPath);
            const isDir = stats.isDirectory();
            const fileName = path.basename(sourcePath || actualPath);
            let s3Key, fileStream, contentType;

            if (isDir) {
                const tempZip = path.join(LABS_DIR, `_transfer_${Date.now()}.zip`);
                broadcastLog('system', `📦 Zipping ${fileName}...`, 'info');

                await new Promise((resolve, reject) => {
                    const output = createWriteStream(tempZip);
                    const archive = archiver('zip', { zlib: { level: 9 } });
                    output.on('close', resolve);
                    archive.on('error', reject);
                    archive.pipe(output);
                    archive.directory(actualPath, fileName);
                    archive.finalize();
                });

                fileStream = createReadStream(tempZip);
                s3Key = targetPath || `system-backups/${os.hostname()}/${fileName}.zip`;
                contentType = 'application/zip';
            } else {
                s3Key = targetPath || `system-backups/${os.hostname()}/${Date.now()}_${fileName}`;
                fileStream = createReadStream(actualPath);
                contentType = 'application/octet-stream';
            }

            broadcastLog('system', `🚀 Uploading ${fileName} to Cloud...`, 'info');
            await S3Service.uploadStream(s3Key, fileStream, contentType);

            broadcastLog('system', `✅ Transfer complete: ${fileName}`, 'success');
            res.json({ success: true, key: s3Key });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};

