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
    const { LABS_DIR, broadcastLog, broadcastState, io } = dependencies;

    // Initialize Services with dependencies
    CloudCache.init(dependencies);
    JobService.init(dependencies);

    // V6: Helper to emit real-time cloud updates
    const emitCloudUpdate = (action, data) => {
        if (io) {
            io.emit('cloud:update', { action, ...data, timestamp: Date.now() });
            console.log(`[CloudSync] Emitted cloud:update: ${action}`);
            cacheStatus: { isReady: true, instant: true, source: 'native-mount' }
        });
    }

    // V5: Use cache-first approach for instant loading
    if (CloudCache.isReady()) {
        // Derive folders and files from cache
        const allFiles = CloudCache.getCachedFiles();

        // Find unique folders at this level
        const folderSet = new Set();
        const filesAtLevel = [];

        for (const file of allFiles) {
            if (!file.key.startsWith(prefix)) continue;

            const relativePath = file.key.slice(prefix.length);
            const slashIndex = relativePath.indexOf('/');

            if (slashIndex === -1) {
                // Direct file at this level
                filesAtLevel.push(file);
            } else {
                // Subfolder
                const folderName = relativePath.slice(0, slashIndex);
                folderSet.add(folderName);
            }
        }

        // Build folders with stats
        const folders = Array.from(folderSet).map(folderName => {
            const folderKey = prefix + folderName + '/';
            const stats = CloudCache.getFolderStats(folderKey);
            return {
                key: folderKey,
                name: folderName,
                type: 'folder',
                ...stats,
                isLoading: false,
                isComplete: true
            };
        });

        // Build files
        const files = filesAtLevel.map(item => ({
            key: item.key,
            name: item.key.replace(prefix, ''),
            size: item.size,
            lastModified: item.lastModified,
            type: 'file',
            etag: item.etag
        }));

        return res.json({
            prefix,
            folders,
            files,
            cacheStatus: { ...CloudCache.getStatus(), instant: true }
        });
    }

    // Fallback: Cache not ready, use S3 directly (slower)
    console.log('[S3Tree] Cache not ready, falling back to S3...');
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

// Proxy S3 Stream to bypass CORS
router.get('/proxy', (req, res) => {
    const key = req.query.key;
    if (!key) return res.status(400).send('Key required');

    try {
        const stream = S3Service.getReadStream(key);
        stream.on('error', (err) => {
            if (err.code === 'NoSuchKey') return res.status(404).send('Not Found');
            console.error('Proxy Stream Error:', err);
            if (!res.headersSent) res.status(500).send('Stream Error');
        });
        stream.pipe(res);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/preview/:key(*)', async (req, res) => {
    try {
        const key = req.params.key;
        if (!key) return res.status(400).json({ error: 'Key required' });

        // Use Proxy URL
        const url = `/api/cloud/proxy?key=${encodeURIComponent(key)}`;
        res.json({ url });
    } catch (err) {
        console.error('Preview error:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- BATCH UPLOAD (V4 Performance) ---
router.post('/upload/batch', dependencies.multer().array('files'), async (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

    try {
        // Paths is sent as a JSON string array paralleling the files array
        const paths = req.body.paths ? JSON.parse(req.body.paths) : [];
        const batchId = req.body.batchId || 'batch-' + Date.now();

        broadcastLog('system', `☁️ Batch Upload: Processing ${req.files.length} files...`, 'info');

        const uploadPromises = req.files.map((file, index) => {
            let s3Key;
            // Use provided path or fallback
            if (paths[index]) {
                const safePath = paths[index].replace(/\.\./g, '').replace(/^\//, '');
                s3Key = `lab-backups/uploads/${safePath}`;
            } else {
                s3Key = `lab-backups/uploads/${Date.now()}_${file.originalname}`;
            }

            return S3Service.uploadBuffer(s3Key, file.buffer, file.mimetype, {
                originalName: file.originalname,
                uploadDate: new Date().toISOString(),
                batchId
            }).then(result => ({
                status: 'fulfilled',
                name: file.originalname,
                key: s3Key
            })).catch(err => ({
                status: 'rejected',
                name: file.originalname,
                error: err.message
            }));
        });

        const results = await Promise.all(uploadPromises);
        const successful = results.filter(r => r.status === 'fulfilled');
        const failed = results.filter(r => r.status === 'rejected');

        if (failed.length > 0) {
            console.error('Batch Partial Failures:', failed);
            broadcastLog('system', `⚠️ Batch completed with ${failed.length} errors.`, 'warn');
        } else {
            broadcastLog('system', `✅ Batch Upload Success (${successful.length} files)`, 'success');
        }

        // V5: Update cache in real-time
        for (const item of successful) {
            const file = req.files.find(f => f.originalname === item.name);
            CloudCache.addFile({
                key: item.key,
                size: file ? file.size : 0,
                lastModified: new Date(),
                etag: ''
            });
        }

        // V6: Emit real-time update to all connected clients
        if (successful.length > 0) {
            emitCloudUpdate('upload', {
                count: successful.length,
                keys: successful.map(s => s.key)
            });
        }

        res.json({
            success: true,
            total: req.files.length,
            uploaded: successful.length,
            failed: failed.length,
            errors: failed.map(f => ({ name: f.name, error: f.error }))
        });

    } catch (err) {
        console.error('Batch Upload Critical Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- UPLOAD & BACKUP ---
router.post('/upload', dependencies.multer().single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        let s3Key;
        // Normalize path from client (Folder Upload support)
        if (req.body.relativePath) {
            // Basic sanitization
            const safePath = req.body.relativePath.replace(/\.\./g, '').replace(/^\//, '');
            s3Key = `lab-backups/uploads/${safePath}`;
        } else {
            // Fallback for single file
            s3Key = `lab-backups/uploads/${Date.now()}_${req.file.originalname}`;
        }

        broadcastLog('system', `☁️ Uploading ${req.file.originalname}...`, 'info');

        const result = await S3Service.uploadBuffer(s3Key, req.file.buffer, req.file.mimetype, {
            originalName: req.file.originalname,
            uploadDate: new Date().toISOString()
        });

        // Don't spam success logs for bulk uploads
        if (!req.body.batchId) {
            broadcastLog('system', `✅ Upload complete: ${req.file.originalname}`, 'success');
        }

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
        // V5: Update cache in real-time
        CloudCache.removeFile(req.body.key);
        // V6: Emit real-time update to all connected clients
        emitCloudUpdate('delete', { key: req.body.key });
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

