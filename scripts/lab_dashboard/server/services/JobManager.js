/**
 * JobManager - Persistent Job State Service
 * Manages backup job persistence for resume capability after interruptions.
 */

const fs = require('fs-extra');
const path = require('path');

const JOBS_FILE = path.join(__dirname, '../data/jobs.json');

class JobManager {
    constructor() {
        this.jobs = {};
        this.loaded = false;
    }

    /**
     * Initialize - Load jobs from disk
     */
    async init() {
        try {
            await fs.ensureDir(path.dirname(JOBS_FILE));
            if (await fs.pathExists(JOBS_FILE)) {
                const data = await fs.readJson(JOBS_FILE);
                this.jobs = data.pendingJobs || {};

                // Mark any previously "running" jobs as "interrupted"
                for (const jobId of Object.keys(this.jobs)) {
                    if (this.jobs[jobId].status === 'running') {
                        this.jobs[jobId].status = 'interrupted';
                    }
                }
                await this.save();
            }
            this.loaded = true;
            console.log(`[JobManager] Loaded ${Object.keys(this.jobs).length} pending jobs.`);
        } catch (err) {
            console.error('[JobManager] Error loading jobs:', err.message);
            this.jobs = {};
        }
    }

    /**
     * Save current state to disk
     */
    async save() {
        try {
            await fs.writeJson(JOBS_FILE, { pendingJobs: this.jobs }, { spaces: 2 });
        } catch (err) {
            console.error('[JobManager] Error saving jobs:', err.message);
        }
    }

    /**
     * Create or update a job entry
     */
    async saveJob(job) {
        this.jobs[job.jobId] = {
            jobId: job.jobId,
            sourcePath: job.sourcePath,
            targetPrefix: job.targetPrefix,
            snapshotMode: job.snapshotMode || false,
            startedAt: job.startedAt || new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            status: job.status || 'running',
            progress: job.progress || {
                filesScanned: 0,
                filesUploaded: 0,
                bytesUploaded: 0,
                errors: 0
            },
            uploadedKeys: job.uploadedKeys || []
        };
        await this.save();
    }

    /**
     * Update job progress (called periodically during upload)
     */
    async updateProgress(jobId, progress, uploadedKeys) {
        if (!this.jobs[jobId]) return;

        this.jobs[jobId].lastActivity = new Date().toISOString();
        this.jobs[jobId].progress = progress;
        if (uploadedKeys) {
            this.jobs[jobId].uploadedKeys = uploadedKeys;
        }
        await this.save();
    }

    /**
     * Mark job as completed and remove from pending
     */
    async markCompleted(jobId) {
        if (this.jobs[jobId]) {
            delete this.jobs[jobId];
            await this.save();
        }
    }

    /**
     * Mark job as paused/interrupted
     */
    async markInterrupted(jobId) {
        if (this.jobs[jobId]) {
            this.jobs[jobId].status = 'interrupted';
            this.jobs[jobId].lastActivity = new Date().toISOString();
            await this.save();
        }
    }

    /**
     * Get all interrupted/paused jobs
     */
    getPendingJobs() {
        return Object.values(this.jobs).filter(j => j.status !== 'completed');
    }

    /**
     * Get a specific job
     */
    getJob(jobId) {
        return this.jobs[jobId] || null;
    }

    /**
     * Delete a job (abandon)
     */
    async deleteJob(jobId) {
        if (this.jobs[jobId]) {
            delete this.jobs[jobId];
            await this.save();
        }
    }
}

// Singleton instance
const jobManager = new JobManager();

module.exports = jobManager;
