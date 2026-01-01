const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// Simple concurrency limiter emulation since we can't easily npm install p-limit right now without risk
const limitConcurrency = (concurrency) => {
    const queue = [];
    let activeCount = 0;

    const next = () => {
        activeCount--;
        if (queue.length > 0) {
            const { task, resolve, reject } = queue.shift();
            run(task, resolve, reject);
        }
    };

    const run = async (task, resolve, reject) => {
        activeCount++;
        try {
            const result = await task();
            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            next();
        }
    };

    return (task) => new Promise((resolve, reject) => {
        if (activeCount < concurrency) {
            run(task, resolve, reject);
        } else {
            queue.push({ task, resolve, reject });
        }
    });
};

class BackupEngine extends EventEmitter {
    constructor(s3Client, bucketName, dependencies, jobId) {
        super();
        this.s3 = s3Client;
        this.bucket = bucketName;
        this.deps = dependencies;
        this.jobId = jobId;
        this.limit = limitConcurrency(10); // 10 Concurrent uploads
        this.stopRequested = false;
        this.uploadedKeys = []; // Track for Undo

        // Stats
        this.stats = {
            jobId: this.jobId,
            filesScanned: 0,
            filesUploaded: 0,
            bytesUploaded: 0,
            errors: 0,
            currentFile: ''
        };
    }

    stop() {
        this.stopRequested = true;
    }

    // New: Undo functionality
    async cleanup() {
        if (this.uploadedKeys.length === 0) return;

        console.log(`[BackupEngine] Cleaning up ${this.uploadedKeys.length} files for job ${this.jobId}...`);

        // S3 deleteObjects can handle up to 1000 keys
        const chunks = [];
        for (let i = 0; i < this.uploadedKeys.length; i += 1000) {
            chunks.push(this.uploadedKeys.slice(i, i + 1000));
        }

        for (const chunk of chunks) {
            const params = {
                Bucket: this.bucket,
                Delete: {
                    Objects: chunk.map(key => ({ Key: key }))
                }
            };
            await this.s3.deleteObjects(params).promise();
        }
        console.log(`[BackupEngine] Cleanup complete for job ${this.jobId}`);
    }

    async startBackup(sourceRoot, targetPrefix) {
        console.log(`[BackupEngine ${this.jobId}] Starting recursive backup: ${sourceRoot} -> ${this.bucket}/${targetPrefix}`);
        this.stopRequested = false;
        // Reset stats but keep jobId
        this.stats = { ...this.stats, filesScanned: 0, filesUploaded: 0, bytesUploaded: 0, errors: 0, currentFile: '' };

        try {
            await this.processDirectory(sourceRoot, targetPrefix);
            this.emit('complete', this.stats);
            return this.stats;
        } catch (err) {
            this.emit('error', err);
            throw err;
        }
    }

    async processDirectory(currentPath, currentPrefix) {
        if (this.stopRequested) return;

        try {
            const items = await fs.promises.readdir(currentPath, { withFileTypes: true });

            for (const item of items) {
                if (this.stopRequested) break;

                // Exclusions
                if (['pagefile.sys', 'hiberfil.sys', 'swapfile.sys', 'System Volume Information', '$Recycle.Bin', 'Config.Msi'].includes(item.name)) {
                    continue;
                }

                const fullPath = path.join(currentPath, item.name);
                const s3Key = `${currentPrefix}/${item.name}`.replace(/\\/g, '/'); // Ensure S3 uses forward slashes

                if (item.isDirectory()) {
                    await this.processDirectory(fullPath, s3Key);
                } else {
                    this.stats.filesScanned++;
                    // Schedule Upload
                    await this.limit(() => this.uploadFile(fullPath, s3Key));
                }
            }
        } catch (err) {
            console.error(`[BackupEngine] Access Error ${currentPath}:`, err.message);
            this.stats.errors++;
            this.emit('progress', this.stats);
        }
    }

    async uploadFile(filePath, s3Key) {
        if (this.stopRequested) return;

        try {
            const stats = await fs.promises.stat(filePath);
            this.stats.currentFile = filePath;
            this.emit('progress', this.stats);

            // Create Stream
            const fileStream = fs.createReadStream(filePath);

            const uploadParams = {
                Bucket: this.bucket,
                Key: s3Key,
                Body: fileStream,
                Metadata: {
                    originalPath: filePath,
                    backupDate: new Date().toISOString()
                }
            };

            await this.s3.upload(uploadParams).promise();

            this.uploadedKeys.push(s3Key); // Track success
            this.stats.filesUploaded++;
            this.stats.bytesUploaded += stats.size;

            // Emit file uploaded event for real-time UI update
            this.emit('fileUploaded', {
                key: s3Key,
                size: stats.size,
                lastModified: new Date().toISOString(),
                jobId: this.jobId
            });

            // Emit progress every 5 files or so to avoid spamming
            if (this.stats.filesUploaded % 5 === 0) {
                this.emit('progress', this.stats);
            }

        } catch (err) {
            console.error(`[BackupEngine] Upload Failed ${filePath}:`, err.message);
            this.stats.errors++;
            // Don't stop the whole process for one locked/error file, just log it
        }
    }
}

module.exports = BackupEngine;
