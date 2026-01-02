const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

class MountManager {
    constructor() {
        this.dependencies = null;
        this.isMounted = false;
        this.process = null;
        this.mountPoint = null;
        this.rcloneBin = null;
        this.configPath = null;
        this.startTime = null;
        this.retryCount = 0;
        this.maxRetries = 5;
    }

    init(dependencies) {
        this.dependencies = dependencies;
        const { LABS_DIR } = dependencies;

        // Setup Paths
        this.rcloneBin = path.join(__dirname, '../bin/rclone.exe');
        this.mountPoint = path.join(__dirname, '../mnt/cloud');
        this.configPath = path.join(__dirname, '../rclone.conf');

        // Ensure directories exist
        fs.ensureDirSync(path.dirname(this.rcloneBin));
        fs.ensureDirSync(this.mountPoint);

        this.log('Initialized MountManager');
        this.log(`Bin: ${this.rcloneBin}`);
        this.log(`Mount: ${this.mountPoint}`);

        if (!fs.existsSync(this.rcloneBin)) {
            this.log('ERROR: rclone.exe not found in server/bin/', 'error');
            return false;
        }

        return true;
    }

    log(message, type = 'info') {
        const { io } = this.dependencies || {};
        const logEntry = {
            timestamp: new Date().toISOString(),
            service: 'rclone',
            message,
            type
        };

        // Emit to frontend (System Ops Console)
        if (io) {
            io.emit('sys:log', logEntry);
        }

        // Also log to backend console
        const prefix = `[MountManager]`;
        if (type === 'error') console.error(`${prefix} ${message}`);
        else console.log(`${prefix} ${message}`);
    }

    // Generate config on the fly from env vars
    async generateConfig() {
        const config = `[vultr]
type = s3
provider = Vultr
access_key_id = ${process.env.VULTR_ACCESS_KEY}
secret_access_key = ${process.env.VULTR_SECRET_KEY}
endpoint = ${process.env.VULTR_ENDPOINT}
acl = private
`;
        await fs.writeFile(this.configPath, config);
        this.log('Config generated successfully');
    }

    async mount() {
        if (this.isMounted) return;
        if (!process.env.VULTR_ACCESS_KEY) {
            this.log('Skipping mount: credentials missing', 'warn');
            return;
        }

        try {
            await this.generateConfig();

            // Flags tuned for stability and observability
            const args = [
                'mount',
                'vultr:/',
                this.mountPoint,
                '--config', this.configPath,
                '--vfs-cache-mode', 'full', // Critical for reliability
                '--vfs-cache-max-age', '1h',
                '--dir-cache-time', '30s',
                '--poll-interval', '15s', // Faster sync of external changes
                '--read-only', // Start safe (optional)
                '--no-console', // Hide popup
                '--log-level', 'INFO', // Capture logs
                '--stats', '10s' // Periodic stats
            ];

            this.log(`Spawning rclone with args: ${args.join(' ')}`);

            this.process = spawn(this.rcloneBin, args, {
                cwd: path.dirname(this.rcloneBin),
                windowsHide: true
            });

            this.startTime = Date.now();
            this.isMounted = true; // Optimistic, verified later

            // --- Log Streaming ---
            this.process.stdout.on('data', (data) => {
                this.log(data.toString().trim(), 'info');
            });

            this.process.stderr.on('data', (data) => {
                // Rclone uses stderr for logs mostly
                this.log(data.toString().trim(), 'info');
            });

            this.process.on('error', (err) => {
                this.log(`Process Error: ${err.message}`, 'error');
                this.isMounted = false;
            });

            this.process.on('close', (code) => {
                this.log(`Process exited with code ${code}`, code === 0 ? 'info' : 'error');
                this.isMounted = false;
                this.process = null;

                // Auto-Restart Logic
                if (code !== 0 && code !== null) {
                    this.log('Unexpected exit. Attempting restart in 5s...', 'warn');
                    setTimeout(() => {
                        this.retryCount++;
                        if (this.retryCount <= this.maxRetries) {
                            this.mount();
                        } else {
                            this.log('Max retries reached. Giving up.', 'error');
                        }
                    }, 5000);
                }
            });

            // Verify Mount Health after 5 seconds
            setTimeout(async () => {
                if (await this.checkHealth()) {
                    this.log('✅ Mount Verified & Healthy', 'success');
                    this.retryCount = 0; // Reset retries on success
                } else {
                    this.log('❌ Mount Health Check Failed (Drive empty or inaccessible)', 'error');
                    // Could trigger unmount force here
                }
            }, 5000);

        } catch (err) {
            this.log(`Mount Start Failed: ${err.message}`, 'error');
        }
    }

    async checkHealth() {
        try {
            if (!this.process) return false;
            // Native FS check: Does directory contain anything?
            // Note: Empty bucket = 0 files, so this might be false positive. 
            // Better check: Can we stat the mount point?
            const stats = await fs.stat(this.mountPoint);
            return stats.isDirectory();
        } catch (e) {
            return false;
        }
    }

    async unmount() {
        if (this.process) {
            this.log('Unmounting...');
            this.process.kill();
            this.process = null;
            this.isMounted = false;
        }
    }

    getStatus() {
        return {
            available: fs.existsSync(this.rcloneBin),
            mounted: this.isMounted,
            uptime: this.startTime ? (Date.now() - this.startTime) / 1000 : 0,
            mountPoint: this.mountPoint,
            pid: this.process?.pid
        };
    }

    isReady() {
        return this.isMounted; // We rely on health check loop mostly
    }
}

module.exports = new MountManager();
