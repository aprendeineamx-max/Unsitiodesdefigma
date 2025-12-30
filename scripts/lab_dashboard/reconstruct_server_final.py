
import os

path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the server.listen block at the end
start_marker = "const PORT = 3000;"
idx = text.rfind(start_marker)

if idx == -1:
    print("Could not find start marker")
    exit(1)

base_code = text[:idx]

missing_code = r"""
// ==========================================
// TRASH MANAGEMENT (Continued)
// ==========================================
app.get('/api/trash/list', async (req, res) => {
    try {
        const trashDir = path.join(LABS_DIR, '_Trash');
        if (!fs.existsSync(trashDir)) return res.json([]);
        
        const items = await fs.readdir(trashDir);
        const dirs = [];
        for (const item of items) {
            const itemPath = path.join(trashDir, item);
            const stat = await fs.stat(itemPath);
            if (stat.isDirectory()) dirs.push({ id: item });
        }
        res.json(dirs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/restore', async (req, res) => {
    try {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'Missing version' });

        const trashPath = path.join(LABS_DIR, '_Trash', version);
        const targetPath = path.join(LABS_DIR, version);

        if (!fs.existsSync(trashPath)) return res.status(404).json({ error: 'Not found in trash' });
        if (fs.existsSync(targetPath)) return res.status(409).json({ error: 'Already exists' });

        await fs.move(trashPath, targetPath);
        
        broadcastLog('system', `✅ Restored ${version} from Trash`, 'success');
        broadcastState();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/trash/empty', async (req, res) => {
    try {
        const trashDir = path.join(LABS_DIR, '_Trash');
        if (!fs.existsSync(trashDir)) return res.json({ success: true, deleted: 0 });

        const items = await fs.readdir(trashDir);
        for (const item of items) {
            await fs.remove(path.join(trashDir, item));
        }
        
        broadcastLog('system', `🗑️ Emptied trash`, 'info');
        broadcastState();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// BULK OPERATIONS
// ==========================================
app.post('/api/bulk/start', async (req, res) => {
    try {
        const { versions, startPort, parallel } = req.body;
        if (!versions || !Array.isArray(versions)) return res.status(400).json({ error: 'Invalid versions' });

        const basePort = startPort || 5200;
        const results = [];

        if (parallel) {
            const promises = versions.map((v, i) => startProcess(v, basePort + i).then(() => ({ version: v, success: true })).catch(e => ({ version: v, success: false, error: e.message })));
            const settled = await Promise.allSettled(promises);
            settled.forEach(r => results.push(r.value || r.reason));
        } else {
            for (let i = 0; i < versions.length; i++) {
                try {
                    await startProcess(versions[i], basePort + i);
                    results.push({ version: versions[i], success: true });
                    await new Promise(r => setTimeout(r, 1000));
                } catch (e) {
                    results.push({ version: versions[i], success: false, error: e.message });
                }
            }
        }
        broadcastState();
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bulk/stop', async (req, res) => {
    try {
        const { versions } = req.body;
        if (!versions) return res.status(400).json({ error: 'Invalid versions' });

        for (const v of versions) {
            await stopProcess(v);
        }
        
        broadcastState();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// HEALTH & METRICS
// ==========================================
app.get('/api/health/:versionId', async (req, res) => {
    try {
        const { versionId } = req.params;
        const proc = activeProcesses.get(versionId);
        
        if (!proc) return res.json({ status: 'stopped', healthy: false });

        let processAlive = true;
        try { process.kill(proc.pid, 0); } catch { processAlive = false; }
        
        res.json({ 
            status: proc.status, 
            healthy: processAlive,
            checks: { pid: proc.pid, port: proc.port }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/metrics/:versionId', async (req, res) => {
    try {
        const { versionId } = req.params;
        const proc = activeProcesses.get(versionId);
        if (!proc) return res.status(404).json({ error: 'Not running' });

        const stats = await pidusage(proc.pid);
        res.json({
            versionId,
            pid: proc.pid,
            port: proc.port,
            status: proc.status,
            cpu: { current: parseFloat(stats.cpu.toFixed(2)), unit: '%' },
            memory: { current: Math.round(stats.memory / 1024 / 1024), unit: 'MB' },
            uptime: { seconds: Math.floor((Date.now() - proc.startTime.getTime()) / 1000), formatted: '0s' }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// CONFIG & ENV
// ==========================================
app.get('/api/config/:versionId', async (req, res) => {
    try {
        const pkgPath = path.join(LABS_DIR, req.params.versionId, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
            res.json({ packageJson: pkg });
        } else {
            res.json({});
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/env/:versionId', async (req, res) => {
    try {
        const envPath = path.join(LABS_DIR, req.params.versionId, '.env');
        if (!fs.existsSync(envPath)) return res.json({});
        
        const content = await fs.readFile(envPath, 'utf-8');
        const vars = {};
        content.split('\n').forEach(line => {
            const [k, ...v] = line.trim().split('=');
            if (k && !k.startsWith('#')) vars[k] = v.join('=');
        });
        res.json(vars);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/env/:versionId', async (req, res) => {
    try {
        const envPath = path.join(LABS_DIR, req.params.versionId, '.env');
        const lines = Object.entries(req.body).map(([k, v]) => `${k}=${v}`);
        await fs.writeFile(envPath, lines.join('\n'), 'utf-8');
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// SNAPSHOTS
// ==========================================
app.post('/api/snapshots/:versionId', async (req, res) => {
    try {
        const { versionId } = req.params;
        const { name } = req.body;
        const sourcePath = path.join(LABS_DIR, versionId);
        if (!fs.existsSync(sourcePath)) return res.status(404).json({ error: 'Not found' });

        const snapDir = path.join(LABS_DIR, '_Snapshots', versionId, name || `snap_${Date.now()}`);
        await fs.copy(sourcePath, snapDir, { filter: s => !s.includes('node_modules') });
        
        const meta = { id: name, timestamp: Date.now() };
        await fs.writeJson(path.join(snapDir, '.snapshot-meta.json'), meta);
        
        res.json({ success: true, snapshot: meta });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/snapshots/:versionId', async (req, res) => {
    try {
        const snapDir = path.join(LABS_DIR, '_Snapshots', req.params.versionId);
        if (!fs.existsSync(snapDir)) return res.json({ snapshots: [] });
        
        const items = await fs.readdir(snapDir);
        const snaps = []; // Simplified listing
        for (const item of items) {
             const metaPath = path.join(snapDir, item, '.snapshot-meta.json');
             if (fs.existsSync(metaPath)) snaps.push(await fs.readJson(metaPath));
        }
        res.json({ snapshots: snaps });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/snapshots/:versionId/restore', async (req, res) => {
    try {
        const { versionId } = req.params;
        const { snapshotId } = req.body;
        
        await stopProcess(versionId);
        
        const sourcePath = path.join(LABS_DIR, versionId);
        const snapPath = path.join(LABS_DIR, '_Snapshots', versionId, snapshotId);
        
        if (!fs.existsSync(snapPath)) return res.status(404).json({ error: 'Snapshot not found' });
        
        await fs.emptyDir(sourcePath);
        await fs.copy(snapPath, sourcePath, { filter: s => !s.includes('.snapshot-meta.json') });
        
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// CLONE
// ==========================================
app.post('/api/clone', async (req, res) => {
    try {
        const { sourceVersion, targetVersion, includeDeps } = req.body;
        const src = path.join(LABS_DIR, sourceVersion);
        const dest = path.join(LABS_DIR, targetVersion);
        
        if (!fs.existsSync(src)) return res.status(404).json({ error: 'Source not found' });
        if (fs.existsSync(dest)) return res.status(409).json({ error: 'Target exists' });
        
        await fs.copy(src, dest, { 
            filter: s => includeDeps ? true : (!s.includes('node_modules') && !s.includes('.git')) 
        });
        
        // Update package.json name if exists
        const pkgPath = path.join(dest, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = await fs.readJson(pkgPath);
            pkg.name = targetVersion;
            await fs.writeJson(pkgPath, pkg, { spaces: 2 });
        }
        
        res.json({ success: true, targetVersion });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// SYSTEM
// ==========================================
app.get('/api/system/info', (req, res) => {
    res.json({
        system: {
            nodeVersion: process.version,
            platform: process.platform,
            memory: { used: '20MB', total: '1GB' }
        },
        zips: { total: 0, active: activeProcesses.size },
        processes: { running: activeProcesses.size } 
    });
});

"""

final_text = base_code + missing_code + start_marker + text[idx+len(start_marker):]

with open(path, 'w', encoding='utf-8') as f:
    f.write(final_text)

print("Server.js fully reconstructed.")
