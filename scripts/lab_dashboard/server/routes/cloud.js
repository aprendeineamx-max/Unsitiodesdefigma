const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const archiver = require('archiver');
const { createWriteStream, createReadStream, existsSync } = require('fs');
const fs = require('fs-extra');
const path = require('path');

module.exports = (dependencies) => {
    const { LABS_DIR, broadcastLog, broadcastState } = dependencies;

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

    // GET /list
    router.get('/list', async (req, res) => {
        try {
            const params = {
                Bucket: BUCKET_NAME
                // Removed Prefix to allow viewing 'uploads/', 'system-backups/', etc.
            };

            const data = await s3.listObjectsV2(params).promise();

            const backups = (data.Contents || []).map(item => ({
                key: item.Key,
                size: item.Size,
                lastModified: item.LastModified,
                versionId: item.Key.split('/').length > 1 ? item.Key.split('/')[1] : 'root',
                etag: item.ETag
            }));

            res.json(backups);

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

    return router;
};
