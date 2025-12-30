
import os

path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"

full_code = r"""
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const treeKill = require('tree-kill');
const pidusage = require('pidusage');
const StreamZip = require('node-stream-zip');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.use(cors());
app.use(express.json());

const LABS_DIR = path.join(__dirname, '..', '..', 'Figma_Labs');
const LEGACY_DIR = path.join(__dirname, '..', '..', 'Figma_Lab');

if (!fs.existsSync(LABS_DIR)) fs.mkdirSync(LABS_DIR, { recursive: true });

const activeProcesses = new Map();

// MONITORING LOOP
setInterval(async () => {
    if (activeProcesses.size === 0) return;
    const stats = {};
    for (const [id, proc] of activeProcesses.entries()) {
        try {
            const stat = await pidusage(proc.pid);
            stats[id] = { cpu: stat.cpu, memory: stat.memory, elapsed: stat.elapsed, timestamp: Date.now() };
            if (stat.cpu > 80) broadcastLog(id, `⚠️ High CPU: ${stat.cpu.toFixed(1)}%`, 'warn');
        } catch (err) {}
    }
    if (Object.keys(stats).length > 0) io.emit('stats-update', stats);
}, 2000);

// HELPERS
function broadcastState() {
    io.emit('state-update', getVersionsState());
}

function broadcastLog(versionId, text, type = 'info') {
    const entry = { versionId, text, type, timestamp: new Date().toISOString() };
    io.emit('log', entry);
    const proc = activeProcesses.get(versionId);
    if (proc) {
        if (!proc.logs) proc.logs = [];
        proc.logs.push(entry);
    }
}

function getVersionsState() {
    const versions = [];
    try {
        if (fs.existsSync(LABS_DIR)) {
            fs.readdirSync(LABS_DIR).forEach(item => {
                const p = path.join(LABS_DIR, item);
                if (fs.statSync(p).isDirectory() && !item.startsWith('.') && !item.startsWith('_')) {
                    const proc = activeProcesses.get(item);
                    versions.push({
                        id: item,
                        path: p,
                        type: 'lab',
                        status: proc ? proc.status : 'stopped',
                        port: proc ? proc.port : null,
                        pid: proc ? proc.pid : null
                    });
                }
            });
        }
    } catch (err) {}
    return versions;
}

// PROCESS MANAGER
async function startProcess(versionId, preferredPort) {
    if (activeProcesses.has(versionId)) return;
    const cwd = path.join(LABS_DIR, versionId);
    if (!fs.existsSync(cwd)) return;

    // Check node_modules
    if (!fs.existsSync(path.join(cwd, 'node_modules'))) {
        broadcastLog(versionId, '📦 Installing dependencies...', 'warn');
        try {
            await new Promise((resolve, reject) => {
                const inst = spawn('npm.cmd', ['install'], { cwd, stdio: 'ignore', shell: true });
                inst.on('close', code => code === 0 ? resolve() : reject(new Error('Install failed')));
            });
            broadcastLog(versionId, '✅ Dependencies installed', 'success');
        } catch (e) {
            broadcastLog(versionId, `❌ Install failed: ${e.message}`, 'error');
            return;
        }
    }

    const port = preferredPort || 3001; // Logic for port selection simplified
    broadcastLog(versionId, `🚀 Starting on port ${port}...`, 'info');

    const proc = spawn('node', ['index.js'], {
        cwd,
        env: { ...process.env, PORT: port },
        shell: true
    });

    activeProcesses.set(versionId, { pid: proc.pid, port, status: 'running', startTime: new Date(), logs: [] });
    broadcastState();

    proc.stdout.on('data', d => broadcastLog(versionId, d.toString().trim()));
    proc.stderr.on('data', d => broadcastLog(versionId, d.toString().trim(), 'warn'));
    
    proc.on('close', (code) => {
        activeProcesses.delete(versionId);
        broadcastLog(versionId, `Process exited code ${code}`, 'error');
        broadcastState();
    });
}

function stopProcess(versionId) {
    return new Promise((resolve) => {
        const proc = activeProcesses.get(versionId);
        if (!proc) return resolve();

        broadcastLog(versionId, '🛑 Stopping...', 'warn');
        
        treeKill(proc.pid, 'SIGKILL', (err) => {
            activeProcesses.delete(versionId);
            broadcastState();
            setTimeout(resolve, 1000); // Wait for lock release
        });
    });
}

// UPLOAD
const upload = multer({ dest: path.join(__dirname, 'uploads') });
app.post('/api/upload', upload.single('zipFile'), async (req, res) => {
    try {
        if (!req.file) throw new Error('No file');
        const zip = new StreamZip.async({ file: req.file.path });
        const name = path.parse(req.file.originalname).name;
        const out = path.join(LABS_DIR, name);
        await fs.ensureDir(out);
        await zip.extract(null, out);
        await zip.close();
        await fs.remove(req.file.path);
        broadcastState();
        res.json({ success: true, versionId: name });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ROUTES
app.get('/api/versions', (req, res) => res.json(getVersionsState()));

app.post('/api/start', async (req, res) => {
    await startProcess(req.body.versionId, req.body.port);
    res.json({ success: true });
});

app.post('/api/stop', async (req, res) => {
    await stopProcess(req.body.versionId);
    res.json({ success: true });
});

app.post('/api/archive', async (req, res) => {
    const { version } = req.body;
    await stopProcess(version);
    const src = path.join(LABS_DIR, version);
    const dest = path.join(LABS_DIR, '_Archive', version);
    if (fs.existsSync(src)) {
        await fs.move(src, dest);
        broadcastState();
        res.json({ success: true });
    } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/archive/list', async (req, res) => {
    const dir = path.join(LABS_DIR, '_Archive');
    if (!fs.existsSync(dir)) return res.json([]);
    const items = await fs.readdir(dir); // Simple list
    res.json(items.map(i => ({ id: i })));
});

app.post('/api/unarchive', async (req, res) => {
    const { version } = req.body;
    const src = path.join(LABS_DIR, '_Archive', version);
    const dest = path.join(LABS_DIR, version);
    if (fs.existsSync(src)) {
        await fs.move(src, dest);
        broadcastState();
        res.json({ success: true });
    } else res.status(404).json({ error: 'Not found' });
});

// TRASH EXTENSIONS
app.post('/api/trash', async (req, res) => {
    const { version } = req.body;
    await stopProcess(version);
    const src = path.join(LABS_DIR, version);
    const dest = path.join(LABS_DIR, '_Trash', version);
    if (fs.existsSync(src)) {
        await fs.move(src, dest);
        broadcastState();
        res.json({ success: true });
    } else res.status(404).json({ error: 'Not found' });
});

app.post('/api/delete', async (req, res) => {
    const { version } = req.body;
    await stopProcess(version);
    const src = path.join(LABS_DIR, version);
    if (fs.existsSync(src)) {
        await fs.remove(src);
        broadcastState();
        res.json({ success: true });
    } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/trash/list', async (req, res) => {
    const dir = path.join(LABS_DIR, '_Trash');
    if (!fs.existsSync(dir)) return res.json([]);
    const items = await fs.readdir(dir);
    res.json(items.map(i => ({ id: i })));
});

app.post('/api/restore', async (req, res) => {
    const { version } = req.body;
    const src = path.join(LABS_DIR, '_Trash', version);
    const dest = path.join(LABS_DIR, version);
    if (fs.existsSync(src)) {
        await fs.move(src, dest);
        broadcastState();
        res.json({ success: true });
    } else res.status(404).json({ error: 'Not found' });
});

app.post('/api/trash/empty', async (req, res) => {
    const dir = path.join(LABS_DIR, '_Trash');
    if (fs.existsSync(dir)) await fs.emptyDir(dir);
    broadcastState();
    res.json({ success: true });
});

// ADVANCED
app.post('/api/bulk/start', async (req, res) => {
    let port = req.body.startPort || 5200;
    for (const v of req.body.versions) {
        await startProcess(v, port++);
        await new Promise(r => setTimeout(r, 1000));
    }
    res.json({ success: true });
});

app.post('/api/bulk/stop', async (req, res) => {
    for (const v of req.body.versions) await stopProcess(v);
    res.json({ success: true });
});

app.get('/api/health/:versionId', (req, res) => {
    const proc = activeProcesses.get(req.params.versionId);
    res.json({ status: proc ? proc.status : 'stopped', healthy: !!proc });
});

app.get('/api/metrics/:versionId', async (req, res) => {
    const proc = activeProcesses.get(req.params.versionId);
    if (!proc) return res.status(404).json({});
    try {
        const s = await pidusage(proc.pid);
        res.json({ cpu: s.cpu, memory: s.memory });
    } catch (e) { res.json({}); }
});

app.get('/api/config/:versionId', async (req, res) => {
    const p = path.join(LABS_DIR, req.params.versionId, 'package.json');
    if (fs.existsSync(p)) res.json({ packageJson: JSON.parse(await fs.readFile(p, 'utf-8')) });
    else res.json({});
});

app.get('/api/env/:versionId', async (req, res) => {
    const p = path.join(LABS_DIR, req.params.versionId, '.env');
    if (fs.existsSync(p)) {
        const c = await fs.readFile(p, 'utf-8');
        const v = {};
        c.split('\n').forEach(l => { const [k,val] = l.split('='); if(k) v[k.trim()] = val ? val.trim() : ''; });
        res.json(v);
    } else res.json({});
});

app.post('/api/env/:versionId', async (req, res) => {
    const p = path.join(LABS_DIR, req.params.versionId, '.env');
    const lines = Object.entries(req.body).map(([k,v]) => `${k}=${v}`).join('\n');
    await fs.writeFile(p, lines);
    res.json({ success: true });
});

app.post('/api/snapshots/:versionId', async (req, res) => {
    const { versionId } = req.params;
    const { name } = req.body;
    const src = path.join(LABS_DIR, versionId);
    const dest = path.join(LABS_DIR, '_Snapshots', versionId, name || `snap_${Date.now()}`);
    if (fs.existsSync(src)) {
        await fs.copy(src, dest, { filter: s => !s.includes('node_modules') });
        await fs.writeJson(path.join(dest, '.snapshot-meta.json'), { id: name, timestamp: Date.now() });
        res.json({ success: true });
    } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/snapshots/:versionId', async (req, res) => {
    const dir = path.join(LABS_DIR, '_Snapshots', req.params.versionId);
    if (!fs.existsSync(dir)) return res.json({ snapshots: [] });
    const items = await fs.readdir(dir);
    const snaps = [];
    for(const i of items) {
        const m = path.join(dir, i, '.snapshot-meta.json');
        if(fs.existsSync(m)) snaps.push(await fs.readJson(m));
    }
    res.json({ snapshots: snaps });
});

app.post('/api/snapshots/:versionId/restore', async (req, res) => {
    const { versionId } = req.params;
    const { snapshotId } = req.body;
    await stopProcess(versionId);
    const src = path.join(LABS_DIR, '_Snapshots', versionId, snapshotId);
    const dest = path.join(LABS_DIR, versionId);
    if (fs.existsSync(src)) {
        await fs.emptyDir(dest);
        await fs.copy(src, dest, { filter: s => !s.includes('.snapshot-meta.json') });
        res.json({ success: true });
    } else res.status(404).json({ error: 'Not found' });
});

app.post('/api/clone', async (req, res) => {
    const { sourceVersion, targetVersion, includeDeps } = req.body;
    const src = path.join(LABS_DIR, sourceVersion);
    const dest = path.join(LABS_DIR, targetVersion);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
        await fs.copy(src, dest, { 
            filter: s => includeDeps ? true : (!s.includes('node_modules') && !s.includes('.git')) 
        });
        const p = path.join(dest, 'package.json');
        if (fs.existsSync(p)) {
            const j = await fs.readJson(p);
            j.name = targetVersion;
            await fs.writeJson(p, j, { spaces: 2 });
        }
        res.json({ success: true, targetVersion });
    } else res.status(400).json({ error: 'Invalid clone' });
});

app.get('/api/system/info', (req, res) => {
    res.json({
        system: { nodeVersion: process.version, platform: process.platform },
        zips: { total: 0, active: activeProcesses.size },
        processes: { running: activeProcesses.size }
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Server running on http://localhost:${PORT}`);
});
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(full_code)

print("Server.js completely replaced.")
