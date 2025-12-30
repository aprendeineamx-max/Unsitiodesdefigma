console.log('DEBUG: Starting server.js...');
const express = require('express');
console.log('DEBUG: Express loaded');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');
const treeKill = require('tree-kill');
const pidusage = require('pidusage');
const simpleGit = require('simple-git');
const detectLib = require('detect-port');
const detect = detectLib.default || detectLib;
console.log('DEBUG: Core modules loaded');

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '../../../');
const LABS_DIR = path.join(PROJECT_ROOT, 'Figma_Labs');
const LEGACY_DIR = path.join(PROJECT_ROOT, 'Figma_Lab');

console.log(`DEBUG: LABS_DIR=${LABS_DIR}`);

// Imports with potential side effects
try {
    console.log('DEBUG: Requires storageService...');
    const { listBuckets, uploadFileStream } = require('./storageService');
    console.log('DEBUG: storageService loaded');
    console.log('DEBUG: Requires archiver...');
    const archiver = require('archiver');
    console.log('DEBUG: archiver loaded');
} catch (e) {
    console.error('CRITICAL ERROR LOADING MODULES:', e);
}

// Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// State
const activeProcesses = new Map(); // versionId -> { pid, port, status, startTime, logs: [] }

// ==========================================
// MONITORING LOOP
// ==========================================
setInterval(async () => {
    if (activeProcesses.size === 0) return;

    const stats = {};
    for (const [id, proc] of activeProcesses.entries()) {
        try {
            const stat = await pidusage(proc.pid);
            stats[id] = {
                cpu: stat.cpu,
                memory: stat.memory,
                elapsed: stat.elapsed,
                timestamp: Date.now()
            };

            if (stat.cpu > 80) {
                broadcastLog(id, `⚠️ High CPU usage: ${stat.cpu.toFixed(1)}%`, 'warn');
            }
        } catch (err) {
            // Process dead or restarting
        }
    }

    if (Object.keys(stats).length > 0) {
        io.emit('stats-update', stats);
    }
}, 2000);

// Helper: Ensure Labs Dir
if (!fs.existsSync(LABS_DIR)) fs.mkdirSync(LABS_DIR, { recursive: true });

// ==========================================
// HELPERS
// ==========================================
function broadcastState() {
    const data = getVersionsState();
    io.emit('state-update', data);
}

function broadcastLog(versionId, text, type = 'info') {
    const logEntry = {
        versionId,
        text,
        type,
        timestamp: new Date().toISOString()
    };
    io.emit('log', logEntry);

    // Optional: Store log in memory
    const proc = activeProcesses.get(versionId);
    if (proc) {
        if (!proc.logs) proc.logs = [];
        proc.logs.push(logEntry);
    }
}

// ==========================================
// PROCESS MANAGER
// ==========================================
function getVersionsState() {
    const versions = [];

    // 1. Scan Figma_Labs
    try {
        const items = fs.readdirSync(LABS_DIR);
        items.forEach(item => {
            const fullPath = path.join(LABS_DIR, item);
            if (fs.statSync(fullPath).isDirectory()) {
                const proc = activeProcesses.get(item);
                versions.push({
                    id: item,
                    path: fullPath,
                    type: 'lab',
                    status: proc ? (proc.status || 'running') : 'stopped',
                    port: proc ? proc.port : null,
                    pid: proc ? proc.pid : null
                });
            }
        });

        // 2. Add Legacy (v19/Figma_Lab) if not in new structure
        if (fs.existsSync(LEGACY_DIR)) {
            const legacyId = 'v19-legacy';
            const proc = activeProcesses.get(legacyId);
            versions.push({
                id: legacyId,
                path: LEGACY_DIR,
                type: 'legacy',
                status: proc ? (proc.status || 'running') : 'stopped',
                port: proc ? proc.port : null,
                pid: proc ? proc.pid : null
            });
        }

    } catch (err) {
        console.error('Error scanning directories:', err);
    }

    return versions;
}

// Port Authority: Smart Start
async function startProcess(versionId, preferredPort) {
    if (activeProcesses.has(versionId)) return;

    let cwd;
    if (versionId === 'v19-legacy') {
        cwd = LEGACY_DIR;
    } else {
        cwd = path.join(LABS_DIR, versionId);
    }

    if (!fs.existsSync(cwd)) {
        broadcastLog(versionId, `Directory not found: ${cwd}`, 'error');
        return;
    }

    // Check if node_modules exists
    const nodeModulesPath = path.join(cwd, 'node_modules');
    const needsInstall = !fs.existsSync(nodeModulesPath);

    if (needsInstall) {
        broadcastLog(versionId, `📦 Dependencies missing. Installing automatically...`, 'warn');

        // Run npm install and wait for completion
        try {
            await new Promise((resolve, reject) => {
                const inst = spawn('npm.cmd', ['install'], {
                    cwd,
                    stdio: ['ignore', 'pipe', 'pipe'],
                    shell: true
                });

                inst.stdout.on('data', (d) => {
                    const msg = d.toString();
                    if (msg.includes('added') || msg.includes('packages')) {
                        broadcastLog(versionId, msg.trim(), 'info');
                    }
                });

                inst.stderr.on('data', (d) => {
                    const msg = d.toString();
                    if (msg.toLowerCase().includes('warn')) {
                        broadcastLog(versionId, msg.trim(), 'warn');
                    }
                });

                inst.on('close', (code) => {
                    if (code === 0) {
                        broadcastLog(versionId, `✅ Dependencies installed successfully!`, 'success');
                        resolve();
                    } else {
                        broadcastLog(versionId, `❌ Install failed with code ${code}`, 'error');
                        reject(new Error(`npm install failed with code ${code}`));
                    }
                });

                inst.on('error', (err) => {
                    broadcastLog(versionId, `❌ Install error: ${err.message}`, 'error');
                    reject(err);
                });
            });
        } catch (err) {
            broadcastLog(versionId, `Installation failed. Cannot start server.`, 'error');
            return;
        }
    }

    // Continue with server start (whether we just installed or dependencies already existed)
    broadcastLog(versionId, `🛡️ Checking port availability (preferred: ${preferredPort === 0 ? 'auto' : preferredPort})...`, 'info');

    // 1. Detect available port (use 5174 as base for auto-detect when port=0)
    const basePort = preferredPort === 0 ? 5174 : preferredPort;
    const port = await detect(basePort);

    if (port !== preferredPort) {
        broadcastLog(versionId, `⚠️ Port ${preferredPort} is busy. Switching to available port: ${port}`, 'warn');
    }

    broadcastLog(versionId, `🚀 Starting server on port ${port}...`, 'success');

    // Spawn npm run dev
    const child = spawn('npm.cmd', ['run', 'dev', '--', '--port', port, '--host'], {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
    });

    activeProcesses.set(versionId, {
        pid: child.pid,
        port: port,
        status: 'starting',
        startTime: new Date()
    });

    broadcastState();

    let serverReady = false;

    child.stdout.on('data', (data) => {
        const str = data.toString();
        process.stdout.write(`[${versionId}] ${str}`);

        // Detect when Vite server is ready
        if (str.includes('Local:') || str.includes('ready in')) {
            if (!serverReady) {
                serverReady = true;
                const proc = activeProcesses.get(versionId);
                if (proc) {
                    proc.status = 'running';
                    broadcastLog(versionId, `✅ Server is ready at http://localhost:${port}`, 'success');
                    broadcastState();
                }
            }
        }
        broadcastLog(versionId, str.trim(), 'info');
    });

    child.stderr.on('data', (data) => {
        const str = data.toString();
        broadcastLog(versionId, str.trim(), 'info');
        process.stderr.write(`[${versionId}] ${str}`);
    });

    child.on('close', (code) => {
        broadcastLog(versionId, `Process exited with code ${code}`, code === 0 ? 'success' : 'error');
        activeProcesses.delete(versionId);
        broadcastState();
    });

    // Fallback: Mark as running after 12 seconds even if we didn't detect "ready" message
    setTimeout(() => {
        const proc = activeProcesses.get(versionId);
        if (proc && proc.status === 'starting') {
            proc.status = 'running';
            broadcastLog(versionId, `⏰ Server should be ready now (timeout reached)`, 'info');
            broadcastState();
        }
    }, 12000);
}

function stopProcess(versionId) {
    const proc = activeProcesses.get(versionId);
    if (!proc) return;

    broadcastLog(versionId, '🛑 Stopping server...', 'warn');

    treeKill(proc.pid, 'SIGKILL', (err) => {
        if (err) {
            broadcastLog(versionId, `Failed to kill process: ${err.message}`, 'error');
        } else {
            activeProcesses.delete(versionId);
            broadcastState();
            broadcastLog(versionId, 'Server stopped', 'success');
        }
    });
}

// ==========================================
// UPLOAD HANDLER
// ==========================================
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        // Extract Version number from filename (e.g., "Unsitiodesdefigma(21).zip")
        const match = file.originalname.match(/\((\d+)\)/);
        const versionNum = match ? match[1] : `new-${Date.now()}`;
        const versionId = `v${versionNum}`;
        const targetDir = path.join(LABS_DIR, versionId);

        broadcastLog('system', `📦 Processing upload for ${versionId}...`, 'info');

        // Clean target if exists
        await fs.remove(targetDir);
        await fs.ensureDir(targetDir);

        // Extract
        const zip = new AdmZip(file.path);
        zip.extractAllTo(targetDir, true);

        // Clean upload
        await fs.remove(file.path);

        broadcastLog('system', `✅ Extracted to ${versionId}. Ready to start!`, 'success');

        // Emit action event for GUI sync
        io.emit('action', {
            type: 'ZIP_UPLOADED',
            versionId,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true, versionId });
        broadcastState();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// API ROUTES
// ==========================================
app.get('/api/versions', (req, res) => {
    res.json(getVersionsState());
});

app.post('/api/start', async (req, res) => {
    try {
        const { version, port } = req.body;
        if (!version) return res.status(400).json({ error: 'Missing version' });

        let targetPort = port || 5174;
        await startProcess(version, targetPort);

        // Emit action event for GUI sync
        io.emit('action', {
            type: 'ZIP_STARTED',
            versionId: version,
            timestamp: new Date().toISOString(),
            data: { port: targetPort }
        });

        res.json({ success: true });
    } catch (err) {
        console.error('Error in /api/start:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/stop', (req, res) => {
    const { version } = req.body;
    stopProcess(version);

    // Emit action event for GUI sync
    io.emit('action', {
        type: 'ZIP_STOPPED',
        versionId: version,
        timestamp: new Date().toISOString()
    });

    res.json({ success: true });
});

// ==========================================
// ZIP MANAGEMENT
// ==========================================
app.post('/api/archive', async (req, res) => {
    try {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'Missing version' });

        const sourcePath = path.join(LABS_DIR, version);
        const archiveDir = path.join(LABS_DIR, '_Archive');
        const targetPath = path.join(archiveDir, version);

        if (!fs.existsSync(sourcePath)) {
            return res.status(404).json({ error: 'Version not found' });
        }

        // Stop process if running
        stopProcess(version);

        // Ensure archive directory exists
        await fs.ensureDir(archiveDir);

        // Move to archive
        await fs.move(sourcePath, targetPath, { overwrite: true });

        broadcastLog('system', `📁 Archived ${version} to Archive`, 'success');
        broadcastState();

        // Emit action event for GUI sync
        io.emit('action', {
            type: 'ZIP_ARCHIVED',
            versionId: version,
            timestamp: new Date().toISOString(),
            data: { destination: '_Archive' }
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/trash', async (req, res) => {
    try {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'Missing version' });

        const sourcePath = path.join(LABS_DIR, version);
        const trashDir = path.join(LABS_DIR, '_Trash');
        const targetPath = path.join(trashDir, version);

        if (!fs.existsSync(sourcePath)) {
            return res.status(404).json({ error: 'Version not found' });
        }

        // Stop process if running
        stopProcess(version);

        // Ensure trash directory exists
        await fs.ensureDir(trashDir);

        // Move to trash
        await fs.move(sourcePath, targetPath, { overwrite: true });

        broadcastLog('system', `🗑️ Moved ${version} to Trash`, 'warn');
        broadcastState();

        // Emit action event for GUI sync
        io.emit('action', {
            type: 'ZIP_TRASHED',
            versionId: version,
            timestamp: new Date().toISOString(),
            data: { destination: '_Trash' }
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/delete', async (req, res) => {
    try {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'Missing version' });

        const sourcePath = path.join(LABS_DIR, version);

        if (!fs.existsSync(sourcePath)) {
            return res.status(404).json({ error: 'Version not found' });
        }

        // Stop process if running
        stopProcess(version);

        // Permanently delete
        await fs.remove(sourcePath);

        broadcastLog('system', `❌ Permanently deleted ${version}`, 'error');
        broadcastState();

        // Emit action event for GUI sync
        io.emit('action', {
            type: 'ZIP_DELETED',
            versionId: version,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// BULK OPERATIONS
// ==========================================
app.post('/api/bulk/start', async (req, res) => {
    try {
        const { versions, startPort, parallel } = req.body;
        if (!versions || !Array.isArray(versions)) {
            return res.status(400).json({ error: 'Missing or invalid versions array' });
        }

        broadcastLog('system', `🚀 Bulk start requested for ${versions.length} ZIPs`, 'info');

        const basePort = startPort || 5200;
        const results = [];

        if (parallel) {
            // Start all simultaneously
            const promises = versions.map((version, index) =>
                startProcess(version, basePort + index)
                    .then(() => ({ version, success: true }))
                    .catch((err) => ({ version, success: false, error: err.message }))
            );
            const settled = await Promise.allSettled(promises);
            settled.forEach((result) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                }
            });
        } else {
            // Start sequentially
            for (let i = 0; i < versions.length; i++) {
                const version = versions[i];
                try {
                    await startProcess(version, basePort + i);
                    results.push({ version, success: true });
                    // Small delay between sequential starts
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    results.push({ version, success: false, error: err.message });
                }
            }
        }

        // Emit bulk action event
        io.emit('action', {
            type: 'BULK_START',
            versionIds: versions,
            timestamp: new Date().toISOString(),
            data: { results }
        });

        broadcastLog('system', `✅ Bulk start completed: ${results.filter(r => r.success).length}/${versions.length} successful`, 'success');

        res.json({
            success: true,
            results
        });
    } catch (err) {
        console.error('Bulk start error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bulk/stop', async (req, res) => {
    try {
        const { versions } = req.body;
        if (!versions || !Array.isArray(versions)) {
            return res.status(400).json({ error: 'Missing or invalid versions array' });
        }

        broadcastLog('system', `🛑 Bulk stop requested for ${versions.length} ZIPs`, 'info');

        const results = versions.map(version => {
            try {
                stopProcess(version);
                return { version, success: true };
            } catch (err) {
                return { version, success: false, error: err.message };
            }
        });

        // Emit bulk action event
        io.emit('action', {
            type: 'BULK_STOP',
            versionIds: versions,
            timestamp: new Date().toISOString(),
            data: { results }
        });

        broadcastLog('system', `✅ Bulk stop completed: ${results.filter(r => r.success).length}/${versions.length} successful`, 'success');

        res.json({
            success: true,
            results
        });
    } catch (err) {
        console.error('Bulk stop error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bulk/restart', async (req, res) => {
    try {
        const { versions, delay } = req.body;
        if (!versions || !Array.isArray(versions)) {
            return res.status(400).json({ error: 'Missing or invalid versions array' });
        }

        const restartDelay = delay || 2000; // Default 2 seconds between restarts

        broadcastLog('system', `🔄 Bulk restart requested for ${versions.length} ZIPs`, 'info');

        const results = [];

        for (const version of versions) {
            try {
                // Stop
                stopProcess(version);

                // Wait for process to fully stop
                await new Promise(resolve => setTimeout(resolve, restartDelay));

                // Start  
                await startProcess(version, 0); // Auto-detect port

                results.push({ version, success: true });
            } catch (err) {
                results.push({ version, success: false, error: err.message });
            }
        }

        // Emit bulk action event
        io.emit('action', {
            type: 'BULK_RESTART',
            versionIds: versions,
            timestamp: new Date().toISOString(),
            data: { results }
        });

        broadcastLog('system', `✅ Bulk restart completed: ${results.filter(r => r.success).length}/${versions.length} successful`, 'success');

        res.json({
            success: true,
            results
        });
    } catch (err) {
        console.error('Bulk restart error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// FILE SYSTEM API
// ==========================================
app.get('/api/files', async (req, res) => {
    const { path: queryPath, versionId } = req.query;
    if (!versionId) return res.status(400).json({ error: 'Missing versionId' });

    let basePath;
    if (versionId === 'v19-legacy') basePath = LEGACY_DIR;
    else basePath = path.join(LABS_DIR, versionId);

    const targetPath = queryPath ? path.join(basePath, queryPath) : basePath;

    if (!targetPath.startsWith(basePath)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        if (!fs.existsSync(targetPath)) return res.status(404).json({ error: 'Path not found' });

        const stats = await fs.stat(targetPath);
        if (!stats.isDirectory()) return res.json({ type: 'file', content: 'Use /api/file/read' });

        const items = await fs.readdir(targetPath);
        const result = [];

        for (const item of items) {
            if (item === 'node_modules' || item.startsWith('.')) continue;

            const itemPath = path.join(targetPath, item);
            try {
                const itemStats = await fs.stat(itemPath);
                result.push({
                    name: item,
                    path: path.relative(basePath, itemPath).replace(/\\/g, '/'),
                    type: itemStats.isDirectory() ? 'dir' : 'file',
                    size: itemStats.size
                });
            } catch (e) { }
        }

        result.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'dir' ? -1 : 1;
        });

        res.json({ items: result, path: queryPath || '' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/files/read', async (req, res) => {
    const { path: filePath, versionId } = req.query;
    if (!versionId || !filePath) return res.status(400).json({ error: 'Missing params' });

    let basePath;
    if (versionId === 'v19-legacy') basePath = LEGACY_DIR;
    else basePath = path.join(LABS_DIR, versionId);

    const targetPath = path.join(basePath, filePath);

    if (!targetPath.startsWith(basePath)) return res.status(403).json({ error: 'Access denied' });

    try {
        const content = await fs.readFile(targetPath, 'utf-8');
        res.json({ content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/files/write', async (req, res) => {
    const { path: filePath, versionId, content } = req.body;
    if (!versionId || !filePath || content === undefined) return res.status(400).json({ error: 'Missing params' });

    let basePath;
    if (versionId === 'v19-legacy') basePath = LEGACY_DIR;
    else basePath = path.join(LABS_DIR, versionId);

    const targetPath = path.join(basePath, filePath);

    if (!targetPath.startsWith(basePath)) return res.status(403).json({ error: 'Access denied' });

    try {
        await fs.writeFile(targetPath, content, 'utf-8');
        broadcastLog(versionId, `💾 File saved: ${filePath}`, 'success');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// API DOCUMENTATION & SYSTEM INFO
// ==========================================
app.get('/api/docs', (req, res) => {
    res.json({
        version: '1.0.0',
        name: 'Lab Manager API',
        description: 'Complete API for managing Figma Lab environments',
        baseUrl: 'http://localhost:3000',
        websocket: {
            url: 'ws://localhost:3000',
            events: {
                'state-update': 'Emitted when ZIP states change (start, stop, etc)',
                'log': 'Real-time logs from all ZIPs',
                'stats-update': 'CPU/Memory stats every 2 seconds',
                'action': 'Any user or API action performed'
            }
        },
        endpoints: {
            // Version Management
            versions: {
                method: 'GET',
                path: '/api/versions',
                description: 'Get all ZIP versions and their current status',
                response: [{ id: 'string', path: 'string', type: 'string', status: 'string', port: 'number', pid: 'number' }]
            },
            start: {
                method: 'POST',
                path: '/api/start',
                body: { version: 'string (required)', port: 'number (optional, 0 for auto)' },
                description: 'Start a ZIP server with optional port specification'
            },
            stop: {
                method: 'POST',
                path: '/api/stop',
                body: { version: 'string (required)' },
                description: 'Stop a running ZIP server'
            },
            archive: {
                method: 'POST',
                path: '/api/archive',
                body: { version: 'string (required)' },
                description: 'Move ZIP to _Archive folder'
            },
            trash: {
                method: 'POST',
                path: '/api/trash',
                body: { version: 'string (required)' },
                description: 'Move ZIP to _Trash folder'
            },
            delete: {
                method: 'POST',
                path: '/api/delete',
                body: { version: 'string (required)' },
                description: 'Permanently delete ZIP (irreversible)'
            },
            // File System
            files: {
                method: 'GET',
                path: '/api/files',
                query: { versionId: 'string (required)', path: 'string (optional)' },
                description: 'Browse files in a ZIP directory'
            },
            fileRead: {
                method: 'GET',
                path: '/api/files/read',
                query: { versionId: 'string (required)', path: 'string (required)' },
                description: 'Read file content'
            },
            fileWrite: {
                method: 'POST',
                path: '/api/files/write',
                body: { versionId: 'string', path: 'string', content: 'string' },
                description: 'Write file content'
            },
            // Git Operations
            gitStatus: {
                method: 'GET',
                path: '/api/git/status',
                query: { versionId: 'string (required)' },
                description: 'Get Git repository status'
            },
            gitInit: {
                method: 'POST',
                path: '/api/git/init',
                body: { versionId: 'string' },
                description: 'Initialize Git repository'
            },
            gitCommit: {
                method: 'POST',
                path: '/api/git/commit',
                body: { versionId: 'string', message: 'string' },
                description: 'Commit changes'
            },
            gitRemote: {
                method: 'POST',
                path: '/api/git/remote',
                body: { versionId: 'string', repoUrl: 'string' },
                description: 'Add remote repository'
            },
            gitPush: {
                method: 'POST',
                path: '/api/git/push',
                body: { versionId: 'string', branch: 'string (optional, default: main)' },
                description: 'Push to remote'
            },
            // Upload
            upload: {
                method: 'POST',
                path: '/api/upload',
                contentType: 'multipart/form-data',
                body: { file: 'File (ZIP)' },
                description: 'Upload new ZIP file'
            },
            // System
            systemInfo: {
                method: 'GET',
                path: '/api/system/info',
                description: 'Get system statistics and information'
            },
            docs: {
                method: 'GET',
                path: '/api/docs',
                description: 'This documentation endpoint'
            }
        },
        examples: {
            curl: {
                start: 'curl -X POST http://localhost:3000/api/start -H "Content-Type: application/json" -d \'{"version":"v22","port":5200}\'',
                list: 'curl http://localhost:3000/api/versions',
                stop: 'curl -X POST http://localhost:3000/api/stop -H "Content-Type: application/json" -d \'{"version":"v22"}\''
            },
            nodejs: {
                start: 'await axios.post("http://localhost:3000/api/start", { version: "v22", port: 5200 })',
                list: 'const { data } = await axios.get("http://localhost:3000/api/versions")',
                websocket: 'const socket = io("http://localhost:3000"); socket.on("log", (log) => console.log(log));'
            }
        }
    });
});

app.get('/api/system/info', async (req, res) => {
    try {
        const versions = getVersionsState();
        const activeCount = versions.filter(v => v.status === 'running' || v.status === 'starting').length;
        const stoppedCount = versions.filter(v => v.status === 'stopped').length;

        // Check archive and trash directories
        const archiveDir = path.join(LABS_DIR, '_Archive');
        const trashDir = path.join(LABS_DIR, '_Trash');

        let archiveCount = 0;
        let trashCount = 0;

        if (fs.existsSync(archiveDir)) {
            archiveCount = fs.readdirSync(archiveDir).filter(item =>
                fs.statSync(path.join(archiveDir, item)).isDirectory()
            ).length;
        }

        if (fs.existsSync(trashDir)) {
            trashCount = fs.readdirSync(trashDir).filter(item =>
                fs.statSync(path.join(trashDir, item)).isDirectory()
            ).length;
        }

        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        res.json({
            system: {
                uptime: `${hours}h ${minutes}m`,
                uptimeSeconds: Math.floor(uptime),
                nodeVersion: process.version,
                platform: process.platform,
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
                }
            },
            zips: {
                total: versions.length,
                active: activeCount,
                stopped: stoppedCount,
                archived: archiveCount,
                trash: trashCount
            },
            processes: {
                running: activeProcesses.size,
                details: Array.from(activeProcesses.entries()).map(([id, proc]) => ({
                    id,
                    pid: proc.pid,
                    port: proc.port,
                    status: proc.status,
                    uptime: Math.floor((Date.now() - proc.startTime.getTime()) / 1000) + 's'
                }))
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// GIT OPS CENTER
// ==========================================
require('dotenv').config();

const getGit = (versionId) => {
    let basePath;
    if (versionId === 'v19-legacy') basePath = LEGACY_DIR;
    else basePath = path.join(LABS_DIR, versionId);

    if (!fs.existsSync(basePath)) throw new Error('Lab not found');
    return simpleGit(basePath);
};

app.get('/api/git/status', async (req, res) => {
    const { versionId } = req.query;
    if (!versionId) return res.status(400).json({ error: 'Missing versionId' });

    try {
        const git = getGit(versionId);
        const isRepo = await git.checkIsRepo();

        if (!isRepo) {
            return res.json({ isRepo: false });
        }

        const status = await git.status();
        const remotes = await git.getRemotes(true);

        res.json({
            isRepo: true,
            status,
            remotes,
            currentBranch: status.current
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/git/init', async (req, res) => {
    const { versionId } = req.body;
    try {
        const git = getGit(versionId);
        await git.init();
        broadcastLog(versionId, '🐙 Git Repository initialized', 'success');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/git/commit', async (req, res) => {
    const { versionId, message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    try {
        const git = getGit(versionId);
        await git.add('.');
        const result = await git.commit(message);
        broadcastLog(versionId, `✅ Commit created: ${result.summary.changes} changes`, 'success');
        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/git/remote', async (req, res) => {
    const { versionId, repoUrl } = req.body;
    try {
        const git = getGit(versionId);

        const remotes = await git.getRemotes();
        if (remotes.find(r => r.name === 'origin')) {
            await git.removeRemote('origin');
        }

        await git.addRemote('origin', repoUrl);
        broadcastLog(versionId, `🔗 Remote 'origin' linked to ${repoUrl}`, 'success');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/git/push', async (req, res) => {
    const { versionId, branch } = req.body;
    const targetBranch = branch || 'main';

    try {
        const git = getGit(versionId);
        const token = process.env.GITHUB_TOKEN;
        let remote = 'origin';

        if (token) {
            const remotes = await git.getRemotes(true);
            const origin = remotes.find(r => r.name === 'origin');
            if (origin && origin.refs.push) {
                let url = origin.refs.push;
                if (url.startsWith('https://')) {
                    remote = url.replace('https://', `https://${token}@`);
                }
            }
        }

        broadcastLog(versionId, '⏳ Pushing to GitHub...', 'info');
        await git.push(remote, targetBranch, ['--set-upstream']);

        broadcastLog(versionId, `🚀 Successfully pushed to ${targetBranch}`, 'success');
        res.json({ success: true });
    } catch (err) {
        broadcastLog(versionId, `❌ Push failed: ${err.message}`, 'error');
        res.status(500).json({ error: err.message });
    }
});

// Start Server
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Lab Dashboard API running on http://localhost:${PORT}`);
});
