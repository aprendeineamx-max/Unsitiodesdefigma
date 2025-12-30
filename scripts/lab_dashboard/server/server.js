const express = require('express');
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

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '../../../');
const LABS_DIR = path.join(PROJECT_ROOT, 'Figma_Labs');
const LEGACY_DIR = path.join(PROJECT_ROOT, 'Figma_Lab');

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
fs.ensureDirSync(LABS_DIR);

// ==========================================
// WEBSOCKET LOGGING
// ==========================================
io.on('connection', (socket) => {
    console.log('Client connected');

    // Send initial state
    socket.emit('state-update', getVersionsState());

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

function broadcastState() {
    io.emit('state-update', getVersionsState());
}

function broadcastLog(versionId, text, type = 'info') {
    io.emit('log', { versionId, text, type, timestamp: new Date() });
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
                    status: proc ? 'running' : 'stopped',
                    port: proc ? proc.port : null,
                    pid: proc ? proc.pid : null
                });
            }
        });

        // 2. Add Legacy (v19/Figma_Lab) if not in new structure
        // Note: User migrated Figma_Lab to Figma_Labs/v19?
        // User said "v19 is running on 5173" from "Figma_Lab" folder in root in previous step.
        // So we should check root Figma_Lab too.
        if (fs.existsSync(LEGACY_DIR)) {
            const legacyId = 'v19-legacy';
            const proc = activeProcesses.get(legacyId);
            versions.push({
                id: legacyId,
                path: LEGACY_DIR,
                type: 'legacy',
                status: proc ? 'running' : 'stopped',
                port: proc ? proc.port : null,
                pid: proc ? proc.pid : null
            });
        }

    } catch (err) {
        console.error('Error scanning directories:', err);
    }

    return versions;
}

function startProcess(versionId, targetPort) {
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

    broadcastLog(versionId, `🚀 Starting server on port ${targetPort}...`, 'success');

    // Spawn npm run dev
    const child = spawn('npm.cmd', ['run', 'dev', '--', '--port', targetPort, '--host'], {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
    });

    activeProcesses.set(versionId, {
        pid: child.pid,
        port: targetPort,
        status: 'running',
        startTime: new Date()
    });

    broadcastState();

    child.stdout.on('data', (data) => {
        const str = data.toString();
        // broadcastLog(versionId, str, 'info'); // Too noisy?
        process.stdout.write(`[${versionId}] ${str}`);
    });

    child.stderr.on('data', (data) => {
        const str = data.toString();
        broadcastLog(versionId, str, 'error');
        process.stderr.write(`[${versionId}] ERR: ${str}`);
    });

    child.on('close', (code) => {
        broadcastLog(versionId, `Process exited with code ${code}`, 'warn');
        activeProcesses.delete(versionId);
        broadcastState();
    });
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
        // Regex for (number)
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

        broadcastLog('system', `✅ Extracted to ${versionId}. Installing dependencies...`, 'success');

        // Install Dependencies (Async)
        const install = spawn('npm.cmd', ['install'], { cwd: targetDir, shell: true });

        install.stdout.on('data', d => broadcastLog(versionId, `Unknown: ${d}`, 'info')); // Filter npm logs?
        install.stderr.on('data', d => {
            // npm warnings go to stderr
            // broadcastLog(versionId, `${d}`, 'warn');
        });

        install.on('close', (code) => {
            if (code === 0) {
                broadcastLog(versionId, 'Checking types...', 'info');
                // Install types explicitly if needed? Usually in package.json
                broadcastLog(versionId, '✅ Ready to start!', 'success');
            } else {
                broadcastLog(versionId, `❌ Install failed with code ${code}`, 'error');
            }
            broadcastState();
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

app.post('/api/start', (req, res) => {
    const { id, port } = req.body;
    if (!id || !port) return res.status(400).json({ error: 'Missing id or port' });
    startProcess(id, port);
    res.json({ success: true });
});

app.post('/api/stop', (req, res) => {
    const { id } = req.body;
    stopProcess(id);
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

    // Security Check
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
            if (item === 'node_modules' || item.startsWith('.')) continue; // Hide noise

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

        // Sort: Dirs first
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

// Start Server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`📡 Lab Dashboard API running on http://localhost:${PORT}`);
});
