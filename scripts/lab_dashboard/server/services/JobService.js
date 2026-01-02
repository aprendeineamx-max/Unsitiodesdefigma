const { v4: uuidv4 } = require('uuid');
const BackupEngine = require('./BackupEngine'); // Assuming BackupEngine stays where it is for now, or moved to services
// Wait, previous code required '../services/BackupEngine'. 
// We should probably assume BackupEngine interacts with this service.
// Let's assume BackupEngine is fundamentally a service class too. 
// For now, let's keep it imported from where it was or expect it in same folder?
// The original code was: const BackupEngine = require('../services/BackupEngine');
// Since we are in server/services now, it should be require('./BackupEngine') if we move it, or require('../services/BackupEngine') if not.
// Wait, BackupEngine IS in services usually. Let's check where it is.
// Original cloud.js: const BackupEngine = require('../services/BackupEngine');
// So it is already in services.

const S3Service = require('./S3Service');
const JobManager = require('./JobManager'); // This was separate file too?
// Yes: const jobManager = require('../services/JobManager');

class JobService {
    constructor() {
        this.activeJobs = new Map();
        this.dependencies = null;
        this.BackupEngine = require('./BackupEngine'); // Dynamic require or standard? 
        // Ideally standard but verifying path.
        // Assuming we are in server/services, so ./BackupEngine is correct if it exists there.
        // BUT verify_file showed it as existing in services/BackupEngine.
    }

    init(dependencies) {
        this.dependencies = dependencies;
        // Also init JobManager (persistence)
        const jobManager = require('./JobManager'); // Assuming it's in services
        jobManager.init();
        this.jobManager = jobManager;
    }

    async createMirrorJob(sourcePath, snapshotMode) {
        const jobId = uuidv4();
        const hostname = require('os').hostname();
        let targetPrefix;

        if (snapshotMode) {
            targetPrefix = `backups/${hostname}/C_DRIVE`;
        } else {
            const match = sourcePath.match(/^([a-zA-Z]:)(.*)/);
            if (match) {
                const drive = match[1].replace(':', '');
                const rest = match[2];
                targetPrefix = `backups/${hostname}/${drive}_DRIVE${rest}`.replace(/\\/g, '/');
            } else {
                const folderName = require('path').basename(sourcePath);
                targetPrefix = `backups/${hostname}/${folderName}`;
            }
        }
        if (targetPrefix.endsWith('/')) targetPrefix = targetPrefix.slice(0, -1);

        const engine = new this.BackupEngine(S3Service.getClient(), S3Service.bucketName, this.dependencies, jobId);
        this._setupJobEvents(jobId, engine);

        this.activeJobs.set(jobId, engine);

        // Save initial state
        await this.jobManager.saveJob({
            jobId,
            sourcePath,
            targetPrefix,
            snapshotMode,
            status: 'running',
            progress: { filesScanned: 0, filesUploaded: 0, bytesUploaded: 0, errors: 0 },
            uploadedKeys: []
        });

        // Start
        engine.startBackup(sourcePath, targetPrefix);

        return { jobId, targetPrefix };
    }

    async resumeJob(jobId) {
        const savedJob = this.jobManager.getJob(jobId);
        if (!savedJob) throw new Error('Job not found');

        const engine = new this.BackupEngine(S3Service.getClient(), S3Service.bucketName, this.dependencies, jobId, savedJob.uploadedKeys);
        this._setupJobEvents(jobId, engine);
        this.activeJobs.set(jobId, engine);

        await this.jobManager.saveJob({ ...savedJob, status: 'running' });
        engine.startBackup(savedJob.sourcePath, savedJob.targetPrefix);

        return { jobId, alreadyUploaded: savedJob.uploadedKeys.length };
    }

    async cancelJob(jobId, clean = false) {
        const engine = this.activeJobs.get(jobId);
        if (!engine) throw new Error('Job not active');

        engine.stop();
        if (clean) await engine.cleanup();

        this.activeJobs.delete(jobId);
        this.dependencies.io.emit('backup:canceled', { jobId });
        // Mark as interrupted in persistence
        await this.jobManager.markInterrupted(jobId);

        return { success: true };
    }

    async stopAll(clean = false) {
        const stopped = [];
        for (const [jobId, engine] of this.activeJobs.entries()) {
            engine.stop();
            if (clean) await engine.cleanup();
            stopped.push(jobId);
            this.dependencies.io.emit('backup:canceled', { jobId });
            await this.jobManager.markInterrupted(jobId);
        }
        this.activeJobs.clear();
        return stopped;
    }

    _setupJobEvents(jobId, engine) {
        engine.on('progress', (stats) => this.dependencies.io.emit('backup:progress', stats));

        engine.on('complete', async (stats) => {
            this.dependencies.io.emit('backup:complete', stats);
            this.activeJobs.delete(jobId);
            await this.jobManager.markCompleted(jobId);
        });

        engine.on('error', async (err) => {
            this.dependencies.io.emit('backup:error', { jobId, error: err.message });
            this.activeJobs.delete(jobId);
            await this.jobManager.markInterrupted(jobId);
        });

        engine.on('fileUploaded', (info) => this.dependencies.io.emit('file:uploaded', info));

        engine.on('stateSave', async (data) => {
            await this.jobManager.updateProgress(data.jobId, data.progress, data.uploadedKeys);
        });
    }

    getPendingJobs() {
        return this.jobManager.getPendingJobs();
    }
}

module.exports = new JobService();
