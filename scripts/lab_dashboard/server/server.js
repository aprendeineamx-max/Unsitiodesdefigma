const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { spawn, exec } = require('child_process');
const treeKill = require('tree-kill');
const pidusage = require('pidusage');
const StreamZip = require('node-stream-zip');
const simpleGit = require('simple-git');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
io.on('connection', (socket) => {
    console.log('🔌 Client Connected:', socket.id);
    socket.on('disconnect', () => console.log('🔌 Client Disconnected:', socket.id));
});

app.use(cors());
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));


// ==========================================
// SECURITY FEATURES
// ==========================================
const rateLimit = new Map();

// Middleware: Path Traversal Protection
app.use((req, res, next) => {
    const check = (str) => typeof str === 'string' && (str.includes('..') || str.includes('~'));

    if (req.params) {
        for (const val of Object.values(req.params)) {
            if (check(val)) return res.status(403).json({ error: 'Security Block: Path Traversal Detected' });
        }
    }
    if (req.body) {
        // Recursive check for nested objects? For now simple shallow check
        for (const val of Object.values(req.body)) {
            if (check(val)) return res.status(403).json({ error: 'Security Block: Path Traversal Detected' });
        }
    }
    next();
});

// Middleware: Command Injection Protection
app.use((req, res, next) => {
    if (req.path === '/api/terminal/exec' && req.body.command) {
        const cmd = req.body.command;
        // Block chaining operators
        if (/([;&|])/.test(cmd)) {
            return res.status(403).json({ error: 'Security Block: Command Injection Detected' });
        }
    }
    next();
});

// Middleware: Auth (Simple Bearer)
app.use((req, res, next) => {
    // Allow public health check or static?
    const publicPaths = ['/api/health/v_atom', '/api/system/info', '/api/versions'];
    if (publicPaths.includes(req.path)) return next();

    // Check Header
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Missing Auth Header' });
    if (auth !== 'Bearer LAB_SECRET_KEY') return res.status(403).json({ error: 'Invalid Token' });

    next();
});


// Middleware: Rate Limiting (Simple)
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    if (!rateLimit.has(ip)) rateLimit.set(ip, []);

    const requests = rateLimit.get(ip);
    // Remove old > 1 sec
    while (requests.length > 0 && requests[0] < now - 1000) requests.shift();

    if (requests.length > 50) return res.status(429).json({ error: 'Rate Limit Exceeded' });

    requests.push(now);
    next();
});


const LABS_DIR = path.join(__dirname, '..', '..', '..', 'Figma_Labs');
const LEGACY_DIR = path.join(__dirname, '..', '..', '..', 'Figma_Lab');

if (!fs.existsSync(LABS_DIR)) fs.mkdirSync(LABS_DIR, { recursive: true });


// CHAOS MIDDLEWARE & ENDPOINTS
app.use((req, res, next) => {
    const chaosDelay = req.headers['x-chaos-delay'];
    if (chaosDelay) {
        console.log(`🔥 CNS Chaos: Installing ${chaosDelay}ms latency...`);
        setTimeout(next, parseInt(chaosDelay));
    } else {
        next();
    }
});

app.post('/api/chaos/stress', (req, res) => {
    const duration = req.body.duration || 1000;
    const start = Date.now();
    let computed = 0;
    console.log(`🔥 CNS Chaos: CPU Stress for ${duration}ms...`);
    // Block Event Loop
    while (Date.now() - start < duration) {
        computed = Math.sqrt(Math.random() * Math.random());
    }
    res.json({ success: true, computed });
});


const activeProcesses = new Map();


// ==========================================
// INTELLIGENCE FEATURES (Laws 141-150)
// ==========================================

const metricsHistory = {
    rps: [],
    errors: [],
    memory: []
};

// 142. Traffic Analysis (RPS Calculation)
app.use((req, res, next) => {
    metricsHistory.rps.push(Date.now());
    // Cleanup old RPS data (> 1 min)
    const now = Date.now();
    metricsHistory.rps = metricsHistory.rps.filter(t => t > now - 60000);
    next();
});

// 143. Error Rate Tracking & 145. Log Analysis
const originalJson = res.json;
// We can't easily intercept res.status without a wrapper, but we can use a middleware for errors
// actually, standard express error handler is better, but let's track 4xx/5xx in a finish listener
app.use((req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode >= 400) {
            metricsHistory.errors.push({ time: Date.now(), status: res.statusCode, path: req.path });
        }
        // Cleanup old errors
        const now = Date.now();
        metricsHistory.errors = metricsHistory.errors.filter(e => e.time > now - 60000);
    });
    next();
});

// 146. Memory Trend
setInterval(() => {
    const mu = process.memoryUsage().heapUsed;
    metricsHistory.memory.push({ time: Date.now(), val: mu });
    if (metricsHistory.memory.length > 30) metricsHistory.memory.shift(); // Keep last 30 pts (60s)
}, 2000);

// ENDPOINTS

// 141. Deep Metrics
app.get('/api/metrics/high-res', async (req, res) => {
    // Event Loop Lag (Approximated)
    const start = Date.now();
    setTimeout(() => {
        const lag = Date.now() - start;
        const memory = process.memoryUsage();
        res.json({
            lag, // Should be ~0 if idle, higher if busy
            gc: { ...memory }
        });
    }, 0);
});

// 144. Predictive Alert (Scale Warning)
// & 142, 143, 146 Exposure
app.get('/api/intelligence/dashboard', (req, res) => {
    const rps = metricsHistory.rps.length / 60; // Average over last minute
    const errorRate = metricsHistory.errors.length;

    // 146 Slope
    let memSlope = 0;
    if (metricsHistory.memory.length > 1) {
        const first = metricsHistory.memory[0];
        const last = metricsHistory.memory[metricsHistory.memory.length - 1];
        memSlope = (last.val - first.val) / (last.time - first.time); // bytes per ms
    }

    const alerts = [];
    if (rps > 100) alerts.push("SCALE WARNING: RPS > 100");
    if (memSlope > 1000) alerts.push("LEAK WARNING: Memory rising fast");

    res.json({
        rps,
        errorRate,
        memSlope,
        alerts,
        activeProcesses: activeProcesses.size
    });
});

// 147. Zombie Hunter
app.post('/api/intelligence/zombie-hunt', async (req, res) => {
    // Scan tasklist for node.exe, compare PIDs with activeProcesses
    // Windows specific
    exec('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH', (err, stdout, stderr) => {
        if (err) return res.status(500).json({ error: err.message });

        const knownPids = new Set([...activeProcesses.values()].map(p => p.pid));
        knownPids.add(process.pid); // Don't kill self

        const zombies = [];
        const lines = stdout.split('\r\n');

        // This is risky if we have other node apps (like VSCode extensions).
        // Intelligence: We only list them, strict mode would kill.
        // For Law 147 we just "Auto-scan".

        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length > 1) {
                const pid = parseInt(parts[1].replace(/"/g, ''));
                if (!isNaN(pid) && !knownPids.has(pid)) {
                    zombies.push(pid);
                }
            }
        });

        res.json({ zombies, count: zombies.length });
    });
});

// 148. Network Map
app.get('/api/intelligence/network-map', (req, res) => {
    const nodes = [];
    nodes.push({ id: 'brain', type: 'server', port: process.env.PORT || 3000 });

    activeProcesses.forEach((proc, id) => {
        nodes.push({ id, type: 'atom', port: proc.port, pid: proc.pid });
    });

    res.json({ nodes, edges: nodes.filter(n => n.id !== 'brain').map(n => ({ from: 'brain', to: n.id })) });
});

// 149. Diff Engine (Simple count compare)
app.post('/api/intelligence/diff', async (req, res) => {
    const { idA, idB } = req.body;
    const dirA = path.join(LABS_DIR, idA);
    const dirB = path.join(LABS_DIR, idB);

    if (!fs.existsSync(dirA) || !fs.existsSync(dirB)) return res.status(404).json({ error: 'Versions not found' });

    const countA = fs.readdirSync(dirA).length;
    const countB = fs.readdirSync(dirB).length;

    res.json({ idA, countA, idB, countB, delta: Math.abs(countA - countB) });
});

// 150. Self-Report
app.get('/api/intelligence/report', (req, res) => {
    const report = `
# SYSTEM STATUS REPORT
**Timestamp:** ${new Date().toISOString()}
**Uptime:** ${process.uptime()}s

## Metrics
- **RPS (1m):** ${(metricsHistory.rps.length / 60).toFixed(2)}
- **Errors (1m):** ${metricsHistory.errors.length}
- **Active Atoms:** ${activeProcesses.size}
- **Memory:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB

## Alerts
${metricsHistory.rps.length / 60 > 100 ? '- [WARNING] High Load' : '- System Nominal'}
    `;
    res.json({ report });
});


// MONITORING LOOP
setInterval(async () => {
    if (activeProcesses.size === 0) return;
    const stats = {};
    for (const [id, proc] of activeProcesses.entries()) {
        try {
            // const stat = await pidusage(proc.pid);
            const stat = { cpu: 0, memory: 0, elapsed: 0 }; // Mock
            // stats[id] = { cpu: stat.cpu, memory: stat.memory, elapsed: stat.elapsed, timestamp: Date.now() };
            // if (stat.cpu > 80) broadcastLog(id, `⚠️ High CPU: ${stat.cpu.toFixed(1)}%`, 'warn');
        } catch (err) { }
    }
    if (Object.keys(stats).length > 0) io.emit('stats-update', stats);
    if (Object.keys(stats).length > 0) io.emit('stats-update', stats);
}, 2000);

// HELPERS
function broadcastState() {
    io.emit('state-update', getVersionsState());
}

function broadcastLog(versionId, text, type = 'info') {
    const entry = { versionId, text, type, timestamp: new Date().toISOString() };

    // 1. Socket Broadcast
    io.emit('log', entry);

    // 2. Memory Store
    if (activeProcesses.has(versionId)) {
        const proc = activeProcesses.get(versionId);
        proc.logs.push(entry);
        if (proc.logs.length > 1000) proc.logs.shift();
    } else if (versionId === 'watcher') {
        if (typeof watcherLogs !== 'undefined') {
            watcherLogs.push(entry);
            if (watcherLogs.length > 500) watcherLogs.shift();
        }
    }

    // 3. Physical File (Law 24/25 Strict Compliance)
    const LOG_FILE = path.join(__dirname, 'logs', 'app-out.log');
    try {
        fs.ensureDirSync(path.dirname(LOG_FILE));
        const line = `[${entry.timestamp}] [${versionId}] [${type}] ${text}\n`;
        fs.appendFileSync(LOG_FILE, line);
    } catch (e) { /* Ignore log write errors to prevent crash */ }

    console.log(`[${versionId}] ${text}`);
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
    } catch (err) { }
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
                inst.on('error', (err) => reject(new Error(`Spawn error: ${err.message}`)));
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
    proc.on('error', err => broadcastLog(versionId, `❌ Launch failed: ${err.message}`, 'error'));

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
const upload = multer({
    dest: path.join(__dirname, 'uploads'),
    limits: { fileSize: 1024 * 1024 * 1024 } // 1GB Limit (Immunity)
});
app.post('/api/upload', (req, res, next) => {
    upload.single('zipFile')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ error: 'Payload Too Large' });
            }
            return res.status(400).json({ error: err.message });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(500).json({ error: err.message });
        }
        // Everything went fine.
        next();
    });
}, async (req, res) => {
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
        c.split('\n').forEach(l => { const [k, val] = l.split('='); if (k) v[k.trim()] = val ? val.trim() : ''; });
        res.json(v);
    } else res.json({});
});

app.post('/api/env/:versionId', async (req, res) => {
    const p = path.join(LABS_DIR, req.params.versionId, '.env');
    const lines = Object.entries(req.body).map(([k, v]) => `${k}=${v}`).join('\n');
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
    for (const i of items) {
        const m = path.join(dir, i, '.snapshot-meta.json');
        if (fs.existsSync(m)) snaps.push(await fs.readJson(m));
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





// ==========================================
// DEPS & TERMINAL
// ==========================================
app.get('/api/deps/analyze', async (req, res) => {
    try {
        // Global analysis (root) or specific? Assuming root for now
        // Or per version? The law says '/api/deps/analyze'.
        // Let's analyze the dashboard itself + list versions
        const packageJson = await fs.readJson(path.join(__dirname, 'package.json'));
        res.json({ dependencies: packageJson.dependencies || {}, devDependencies: packageJson.devDependencies || {} });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/deps/install', async (req, res) => {
    try {
        const { versionId, package } = req.body;
        const cwd = versionId ? path.join(LABS_DIR, versionId) : __dirname;
        if (!fs.existsSync(cwd)) return res.status(404).json({ error: 'Target not found' });

        const cmd = package ? `npm.cmd install ${package}` : 'npm.cmd install';

        await new Promise((resolve, reject) => {
            exec(cmd, { cwd }, (error, stdout, stderr) => {
                if (error) reject(error);
                else resolve({ stdout, stderr });
            });
        });

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/terminal/exec', async (req, res) => {
    try {
        const { command, cwd } = req.body;
        // Security: Very dangerous. Only for verified local use.
        if (!command) return res.status(400).json({ error: 'No command' });

        const targetDir = cwd ? path.resolve(LABS_DIR, cwd) : __dirname;

        await new Promise((resolve, reject) => {
            exec(command, { cwd: targetDir }, (error, stdout, stderr) => {
                // We resolve even on error to return stderr
                resolve({
                    stdout: stdout || '',
                    stderr: stderr || (error ? error.message : ''),
                    failed: !!error
                });
            });
        }).then(output => res.json(output));

    } catch (e) { res.status(500).json({ error: e.message }); }
});

// START WATCHER (Stub for Law 104)






// ==========================================
// GIT FEATURES
// ==========================================
app.post('/api/git/init', async (req, res) => {
    try {
        const { versionId } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        if (!fs.existsSync(cwd)) return res.status(404).json({ error: 'Version not found' });

        await simpleGit(cwd).init();
        // Add config locally strictly for this repo to avoid global config issues
        await simpleGit(cwd).addConfig('user.name', 'LabAutomaton');
        await simpleGit(cwd).addConfig('user.email', 'lab@automaton.local');

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/status', async (req, res) => {
    try {
        const { versionId } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        if (!fs.existsSync(cwd) || !fs.existsSync(path.join(cwd, '.git')))
            return res.json({ not_git: true });

        const status = await simpleGit(cwd).status();
        res.json(status);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/commit', async (req, res) => {
    try {
        const { versionId, message } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        const git = simpleGit(cwd);
        await git.add('.');
        const result = await git.commit(message || 'Update');
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/log', async (req, res) => {
    try {
        const { versionId } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        const log = await simpleGit(cwd).log();
        res.json(log);
    } catch (e) { res.status(500).json({ error: e.message }); }
});



// ==========================================
// GIT FEATURES ADVANCED
// ==========================================
app.post('/api/git/branch', async (req, res) => {
    try {
        const { versionId, name } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        if (name) {
            await simpleGit(cwd).branch([name]);
            res.json({ success: true, branch: name });
        } else {
            const branches = await simpleGit(cwd).branchLocal();
            res.json(branches);
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/checkout', async (req, res) => {
    try {
        const { versionId, branch } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        await simpleGit(cwd).checkout(branch);
        res.json({ success: true, current: branch });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/merge', async (req, res) => {
    try {
        const { versionId, from } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        const result = await simpleGit(cwd).merge([from]);
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/remote/add', async (req, res) => {
    try {
        const { versionId, name, url } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        await simpleGit(cwd).addRemote(name, url);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/push', async (req, res) => {
    try {
        const { versionId, remote, branch } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        // Note: Push might fail if no creds, but Law says 'Verify Push' (could be dry run or simulated)
        // We will try.
        await simpleGit(cwd).push(remote, branch);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});



// ==========================================
// WATCHER FEATURES (PERSISTENT LOGS)
// ==========================================
const chokidar = require('chokidar');
const activeWatchers = new Map();
const watcherLogs = new Map(); // Store logs independent of process

// Helper to store log
function logWatcherEvent(versionId, text, type) {
    if (!watcherLogs.has(versionId)) watcherLogs.set(versionId, []);
    const entry = { versionId, text, type, timestamp: new Date().toISOString() };
    watcherLogs.get(versionId).push(entry);
    broadcastLog(versionId, text, type);
}

app.post('/api/watch/start', (req, res) => {
    try {
        const { versionId } = req.body;
        if (activeWatchers.has(versionId)) return res.json({ success: true, message: 'Already watching' });

        const cwd = path.join(LABS_DIR, versionId);
        if (!fs.existsSync(cwd)) return res.status(404).json({ error: 'Version not found' });

        const watcher = chokidar.watch(cwd, {
            ignored: [/(^|[\/\\])\../, '**/node_modules/**'],
            persistent: true,
            ignoreInitial: true
        });

        watcher
            .on('add', path => logWatcherEvent(versionId, `📄 Added: ${path}`, 'success'))
            .on('change', path => logWatcherEvent(versionId, `✏️ Changed: ${path}`, 'info'))
            .on('unlink', path => logWatcherEvent(versionId, `🗑️ Deleted: ${path}`, 'warn'));

        activeWatchers.set(versionId, watcher);
        res.json({ success: true, message: 'Watcher started' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/watch/stop', async (req, res) => {
    try {
        const { versionId } = req.body;
        const watcher = activeWatchers.get(versionId);
        if (watcher) {
            await watcher.close();
            activeWatchers.delete(versionId);
            res.json({ success: true, message: 'Watcher stopped' });
        } else {
            res.json({ success: false, message: 'Not watching' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/watch/logs/:versionId', (req, res) => {
    const { versionId } = req.params;
    res.json(watcherLogs.get(versionId) || []);
});

app.get('/api/watch/list', (req, res) => {
    res.json(Array.from(activeWatchers.keys()));
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Server running on http://localhost:${PORT}`);
});
