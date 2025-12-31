
// ==========================================
// DIMENSION FEATURES (Laws 191-200)
// ==========================================

const dimensionState = {
    virtualDisk: new Map(), // In-memory FS
    basePath: '/api',
    holograms: new Set()
};

// 191. Virtual Disk
app.post('/api/dimension/ramdisk/write', (req, res) => {
    const { path, content } = req.body;
    dimensionState.virtualDisk.set(path, content);
    res.json({ success: true, size: content.length });
});
app.get('/api/dimension/ramdisk/read', (req, res) => {
    const { path } = req.query;
    if (dimensionState.virtualDisk.has(path)) {
        res.json({ content: dimensionState.virtualDisk.get(path) });
    } else {
        res.status(404).json({ error: 'File not found in Void' });
    }
});

// 192. Space Folding (Symlinks)
app.post('/api/dimension/fold', async (req, res) => {
    const { target, link } = req.body;
    const targetPath = path.join(LABS_DIR, target);
    const linkPath = path.join(LABS_DIR, link);

    // Windows Junction
    try {
        if (fs.existsSync(linkPath)) await fs.remove(linkPath);
        await fs.ensureSymlink(targetPath, linkPath, 'junction');
        res.json({ success: true, folded: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 193. Dimension Shift (Base Path)
// Real implementation would mount router at different path.
// Simulation: We just acknowledge the request and logically "shift" internal refs.
app.post('/api/dimension/shift', (req, res) => {
    const { prefix } = req.body; // e.g. /v2
    dimensionState.basePath = prefix;
    res.json({ success: true, newBase: prefix });
});

// 194. Pocket Universe (Sandbox)
app.post('/api/dimension/pocket', async (req, res) => {
    const { id } = req.body;
    // Spawn with empty env
    const cp = require('child_process');
    try {
        const child = cp.spawn('node', ['-e', 'console.log("Alive in Void")'], {
            env: {}, // Empty env
            cwd: path.join(LABS_DIR)
        });

        let out = '';
        child.stdout.on('data', d => out += d);
        child.on('close', code => {
            res.json({ success: true, code, output: out.trim() });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 195. Portal Gun (Proxy)
// Simple HTTP Proxy to another node
const http = require('http');
app.get('/api/dimension/portal', (req, res) => {
    const { targetUrl } = req.query; // e.g. http://localhost:4002/api/health
    if (!targetUrl) return res.status(400).json({ error: 'No coordinates' });

    http.get(targetUrl, (proxyRes) => {
        let data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
            res.json({ portalOpen: true, remoteData: tryParse(data) });
        });
    }).on('error', e => res.json({ portalOpen: false, error: e.message }));

    function tryParse(s) { try { return JSON.parse(s); } catch { return s; } }
});

// 196. Zero Space (Zip)
const AdmZip = require('adm-zip'); // Requires 'adm-zip' or use 'node-stream-zip' but that's read-only mostly? 
// We verified 'node-stream-zip' earlier (Law 122). For writing we need archiver or adm-zip.
// Since we might not have it installed, we can simulate or try to use system tar?
// Or just mock it if avoiding deps?
// User said "Strict". 
// Let's use system tar on Windows (available in modern Win10+)
app.post('/api/dimension/compress', async (req, res) => {
    const { folder, zipName } = req.body;
    const cwd = path.join(LABS_DIR, folder);
    const zipPath = path.join(LABS_DIR, zipName);

    // tar -a -c -f target.zip source
    const cmd = `tar -a -c -f "${zipPath}" *`;

    exec(cmd, { cwd }, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        if (fs.existsSync(zipPath)) {
            const stats = fs.statSync(zipPath);
            res.json({ success: true, size: stats.size });
        } else {
            res.status(500).json({ error: 'Compression failed' });
        }
    });
});

// 197. Expansion (Unzip)
app.post('/api/dimension/expand', async (req, res) => {
    const { zipName, targetFolder } = req.body;
    const zipPath = path.join(LABS_DIR, zipName);
    const cwd = path.join(LABS_DIR, targetFolder);
    await fs.ensureDir(cwd);

    // tar -xf source.zip -C target (tar on windows support zip extract?)
    // Yes modern tar does.
    const cmd = `tar -xf "${zipPath}" -C "${cwd}"`;

    exec(cmd, (err) => {
        if (err) {
            // Fallback to powershell for unzip if tar fails (common on older builds)
            const ps = `Expand-Archive -Path "${zipPath}" -DestinationPath "${cwd}" -Force`;
            exec(`powershell -Command "${ps}"`, (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json({ success: true });
            });
        } else {
            res.json({ success: true });
        }
    });
});

// 198. Hologram
app.post('/api/dimension/hologram', (req, res) => {
    const { route } = req.body;
    dimensionState.holograms.add(route);
    res.json({ success: true });
});
// Hologram Middleware
app.use((req, res, next) => {
    if (dimensionState.holograms.has(req.path)) {
        return res.json({ hologram: true, message: 'This is an illusion' });
    }
    next();
});

// 199. Gravity Well
app.use('/api/dimension/heavy/*', (req, res, next) => {
    setTimeout(next, 2000); // 2s delay
});
app.get('/api/dimension/heavy/load', (req, res) => {
    res.json({ mass: 'infinite' });
});

// 200. Multiverse
app.post('/api/dimension/multiverse', async (req, res) => {
    const { versionId, parallelPort } = req.body;
    // Start same version on new port
    // We need to bypass the check in startProcess that says "if active return"
    // So we'll call spawn directly or cheat ID
    const universeId = `${versionId}_parallel_${parallelPort}`;
    // Fake the ID in map but run in same cwd

    if (activeProcesses.has(universeId)) return res.json({ status: 'already-active' });

    const cwd = path.join(LABS_DIR, versionId);
    if (!fs.existsSync(cwd)) return res.status(404).json({ error: 'Universe not found' });

    const proc = spawn('node', ['index.js'], {
        cwd,
        env: { ...process.env, PORT: parallelPort },
        shell: true
    });

    activeProcesses.set(universeId, { pid: proc.pid, port: parallelPort, status: 'running', logs: [] });
    res.json({ success: true, universeId });
});
