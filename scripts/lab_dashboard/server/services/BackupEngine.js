const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// Enhanced concurrency limiter with cancellation support
const createConcurrencyLimiter = (concurrency, engine) => {
    const queue = [];
    let activeCount = 0;

    const next = () => {
        activeCount--;
        // Skip queued tasks if stop was requested
        while (queue.length > 0 && engine.stopRequested) {
            const { resolve } = queue.shift();
            resolve({ skipped: true });
        }
        if (queue.length > 0 && !engine.stopRequested) {
            const { task, resolve, reject } = queue.shift();
            run(task, resolve, reject);
        }
    };

    const run = async (task, resolve, reject) => {
        activeCount++;
        try {
            // Check stop before running
            if (engine.stopRequested) {
                resolve({ skipped: true });
                activeCount--;
                next();
                return;
            }
            const result = await task();
            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            if (!engine.stopRequested) next();
            else {
                activeCount--;
                // Drain remaining queue on stop
                while (queue.length > 0) {
                    const { resolve } = queue.shift();
                    resolve({ skipped: true });
                }
            }
        }
    };

    return (task) => new Promise((resolve, reject) => {
        if (engine.stopRequested) {
            return resolve({ skipped: true });
        }
        if (activeCount < concurrency) {
            run(task, resolve, reject);
        } else {
            queue.push({ task, resolve, reject });
        }
    });
};

class BackupEngine extends EventEmitter {
    constructor(s3Client, bucketName, dependencies, jobId, alreadyUploadedKeys = []) {
        super();
        this.s3 = s3Client;
        this.bucket = bucketName;
        this.deps = dependencies;
        this.jobId = jobId;
        this.stopRequested = false;
        this.activeUploads = new Map(); // Track active S3 uploads for abort
        this.limit = createConcurrencyLimiter(20, this); // 20 Concurrent uploads (increased from 10)
        this.uploadedKeys = [...alreadyUploadedKeys]; // Start with already uploaded for resume
        this.alreadyUploadedSet = new Set(alreadyUploadedKeys); // For fast lookup
        this.sourcePath = '';
        this.targetPrefix = '';

        // Stats
        this.stats = {
            jobId: this.jobId,
            filesScanned: 0,
            filesUploaded: alreadyUploadedKeys.length, // Start from resume point
            bytesUploaded: 0,
            errors: 0,
            currentFile: ''
        };
    }

    stop() {
        console.log(`[BackupEngine ${this.jobId}] Stop requested! Aborting ${this.activeUploads.size} active uploads...`);
        this.stopRequested = true;

        // Abort all active S3 uploads
        for (const [key, upload] of this.activeUploads.entries()) {
            try {
                upload.abort();
                console.log(`[BackupEngine] Aborted upload: ${key}`);
            } catch (err) {
                console.error(`[BackupEngine] Failed to abort ${key}:`, err.message);
            }
        }
        this.activeUploads.clear();
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
        this.sourcePath = sourceRoot;
        this.targetPrefix = targetPrefix;

        // Reset stats but keep jobId and resume count
        const resumeCount = this.alreadyUploadedSet.size;
        this.stats = {
            ...this.stats,
            filesScanned: 0,
            filesUploaded: resumeCount,
            bytesUploaded: 0,
            errors: 0,
            currentFile: resumeCount > 0 ? 'Resuming...' : ''
        };

        if (resumeCount > 0) {
            console.log(`[BackupEngine ${this.jobId}] Resuming from ${resumeCount} already uploaded files.`);
        }

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

                    // Skip if already uploaded (resume support)
                    if (this.alreadyUploadedSet.has(s3Key)) {
                        continue;
                    }

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

            // Check again before starting upload
            if (this.stopRequested) return;

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

            // Use ManagedUpload so we can abort it
            const managedUpload = this.s3.upload(uploadParams);
            this.activeUploads.set(s3Key, managedUpload);

            try {
                await managedUpload.promise();
            } finally {
                this.activeUploads.delete(s3Key);
            }

            // Check if stopped during upload
            if (this.stopRequested) return;

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

            // Emit state save every 50 files for persistence
            if (this.stats.filesUploaded % 50 === 0) {
                this.emit('stateSave', {
                    jobId: this.jobId,
                    sourcePath: this.sourcePath,
                    targetPrefix: this.targetPrefix,
                    progress: this.stats,
                    uploadedKeys: this.uploadedKeys
                });
            }

        } catch (err) {
            console.error(`[BackupEngine] Upload Failed ${filePath}:`, err.message);
            this.stats.errors++;
            // Don't stop the whole process for one locked/error file, just log it
        }
    }
}

module.exports = BackupEngine;
