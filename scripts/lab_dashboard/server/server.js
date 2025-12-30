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
        res.json({ success: true });
    } catch (err) {
        console.error('Error in /api/start:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/stop', (req, res) => {
    const { version } = req.body;
    stopProcess(version);
    res.json({ success: true });
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
