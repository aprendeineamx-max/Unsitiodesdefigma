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
                Bucket: BUCKET_NAME,
                Prefix: 'lab-backups/'
            };

            const data = await s3.listObjectsV2(params).promise();

            const backups = (data.Contents || []).map(item => ({
                key: item.Key,
                size: item.Size,
                lastModified: item.LastModified,
                versionId: item.Key.split('/')[1],
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

    return router;
};
