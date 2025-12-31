const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// --- Configuration ---
const CONFIG_FILE = path.join(__dirname, '../sync_config.json');
const BUCKET_NAME = process.env.VULTR_BUCKET_NAME || 'lab-backups';

// Initialize S3
const s3 = new AWS.S3({
    endpoint: process.env.VULTR_ENDPOINT,
    accessKeyId: process.env.VULTR_ACCESS_KEY,
    secretAccessKey: process.env.VULTR_SECRET_KEY,
    s3ForcePathStyle: true,
    region: process.env.VULTR_REGION || 'us-east-1'
});

// Robust Ignore Patterns for System Drive Backup
const IGNORED_PATHS = [
    /(^|[\/\\])\../, // Dotfiles (except .env maybe, but usually safe to ignore .git etc)
    /node_modules/,
    /Windows/, // System folders
    /Program Files/,
    /Program Files \(x86\)/,
    /AppData/,
    /\$Recycle\.Bin/,
    /System Volume Information/,
    /pagefile\.sys/,
    /hiberfil\.sys/,
    /swapfile\.sys/,
    /Temp/,
    /tmp/
];

class WatcherService {
    constructor() {
        this.watchedPaths = this.loadConfig();
        this.watcher = null;
        this.isReady = false;
        this.queue = [];
        this.processing = false;

        // Initialize
        this.restartWatcher();
    }

    loadConfig() {
        try {
            if (fs.existsSync(CONFIG_FILE)) {
                return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')).paths || [];
            }
        } catch (e) {
            console.error('Failed to load sync config:', e);
        }
        return [];
    }

    saveConfig() {
        try {
            fs.writeFileSync(CONFIG_FILE, JSON.stringify({ paths: this.watchedPaths }, null, 2));
        } catch (e) {
            console.error('Failed to save sync config:', e);
        }
    }

    async restartWatcher() {
        if (this.watcher) {
            await this.watcher.close();
        }

        if (this.watchedPaths.length === 0) {
            console.log('Watcher: No paths to watch.');
            return;
        }

        console.log(`Watcher: Starting verification of ${this.watchedPaths.length} paths...`);

        // Filter valid paths
        const validPaths = this.watchedPaths.filter(p => fs.existsSync(p));

        if (validPaths.length === 0) return;

        console.log(`Watcher: Watching:`, validPaths);

        this.watcher = chokidar.watch(validPaths, {
            ignored: IGNORED_PATHS,
            persistent: true,
            ignoreInitial: true, // Don't upload everything on startup, only changes
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
            }
        });

        this.watcher
            .on('add', path => this.enqueueUpload(path))
            .on('change', path => this.enqueueUpload(path))
            .on('unlink', path => console.log(`File removed: ${path}`)) // We don't delete from cloud automatically for safety
            .on('error', error => console.error(`Watcher error: ${error}`))
            .on('ready', () => {
                this.isReady = true;
                console.log('Watcher: Initial scan complete. Ready for changes.');
            });
    }

    enqueueUpload(filePath) {
        console.log(`Watcher: Change detected at ${filePath}`);
        this.queue.push(filePath);
        this.processQueue();
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        const filePath = this.queue.shift();

        try {
            await this.uploadFile(filePath);
        } catch (err) {
            console.error(`Watcher: Failed to upload ${filePath}`, err);
        } finally {
            this.processing = false;
            if (this.queue.length > 0) {
                this.processQueue();
            }
        }
    }

    async uploadFile(filePath) {
        // Construct S3 Key
        // We want to preserve the hierarchy relative to the watched root?
        // Or just full path? For C: backup, full path without drive colon might be best.
        // e.g. C:\Users\Docs\file.txt -> system-backups/Users/Docs/file.txt

        const fileStream = fs.createReadStream(filePath);
        const relativePath = filePath.replace(/^([a-zA-Z]):\\/, '').replace(/\\/g, '/');
        const s3Key = `sync_backups/${relativePath}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileStream
        };

        console.log(`Watcher: Uploading ${filePath} to ${s3Key}...`);
        await s3.upload(uploadParams).promise();
        console.log(`Watcher: ✅ Uploaded ${s3Key}`);
    }

    addPath(pathToAdd) {
        if (!this.watchedPaths.includes(pathToAdd)) {
            this.watchedPaths.push(pathToAdd);
            this.saveConfig();
            this.restartWatcher();
            return true;
        }
        return false;
    }

    removePath(pathToRemove) {
        this.watchedPaths = this.watchedPaths.filter(p => p !== pathToRemove);
        this.saveConfig();
        this.restartWatcher();
    }

    getPaths() {
        return this.watchedPaths;
    }
}

module.exports = new WatcherService();
