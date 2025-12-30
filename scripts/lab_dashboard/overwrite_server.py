
import os

path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Find the start of Unarchive to truncate and rewrite
marker = "app.post('/api/unarchive',"
idx = text.find(marker)

if idx == -1:
    print("Unarchive marker not found")
    exit(1)

base_code = text[:idx]

# Full correct code from Unarchive onwards
new_code = r"""
app.post('/api/unarchive', async (req, res) => {
    try {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'Missing version' });

        const archivePath = path.join(LABS_DIR, '_Archive', version);
        const targetPath = path.join(LABS_DIR, version);

        if (!fs.existsSync(archivePath)) {
            return res.status(404).json({ error: 'Archived version not found' });
        }
        
        if (fs.existsSync(targetPath)) {
            return res.status(409).json({ error: 'Version already exists in Labs' });
        }

        await fs.move(archivePath, targetPath);

        broadcastLog('system', `📦 Unarchived ${version}`, 'success');
        broadcastState();

        io.emit('action', {
            type: 'ZIP_RESTORED',
            versionId: version,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// TRASH MANAGEMENT
// ==========================================
app.post('/api/trash', async (req, res) => {
    try {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'Missing version' });

        const sourcePath = path.join(LABS_DIR, version);
        const trashDir = path.join(LABS_DIR, '_Trash');
        const targetPath = path.join(trashDir, version);

        if (!fs.existsSync(sourcePath)) return res.status(404).json({ error: 'Version not found' });

        await stopProcess(version);
        await fs.ensureDir(trashDir);
        await fs.move(sourcePath, targetPath, { overwrite: true });

        broadcastLog('system', `🗑️ Moved ${version} to Trash`, 'warn');
        broadcastState();

        io.emit('action', {
            type: 'ZIP_TRASHED',
            versionId: version,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/delete', async (req, res) => {
    try {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'Missing version' });

        const sourcePath = path.join(LABS_DIR, version);
        if (!fs.existsSync(sourcePath)) return res.status(404).json({ error: 'Version not found' });

        await stopProcess(version);
        await fs.remove(sourcePath);

        broadcastLog('system', `❌ Permanently deleted ${version}`, 'error');
        broadcastState();

        io.emit('action', {
            type: 'ZIP_DELETED',
            versionId: version,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/trash/list', async (req, res) => {
    try {
        const trashDir = path.join(LABS_DIR, '_Trash');
        if (!fs.existsSync(trashDir)) return res.json([]);
        const items = await fs.readdir(trashDir);
        const dirs = [];
        for (const item of items) {
             const itemPath = path.join(trashDir, item);
             if ((await fs.stat(itemPath)).isDirectory()) dirs.push({ id: item });
        }
        res.json(dirs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/restore', async (req, res) => {
    try {
        const { version } = req.body;
        const trashPath = path.join(LABS_DIR, '_Trash', version);
        const targetPath = path.join(LABS_DIR, version);
        if (!fs.existsSync(trashPath)) return res.status(404).json({ error: 'Not found' });
        await fs.move(trashPath, targetPath);
        broadcastState();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/trash/empty', async (req, res) => {
    try {
        const trashDir = path.join(LABS_DIR, '_Trash');
        if (fs.existsSync(trashDir)) await fs.emptyDir(trashDir);
        broadcastState();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// BULK & HEALTH & CONFIG & SNAPSHOTS & CLONE
// ==========================================
app.post('/api/bulk/start', async (req, res) => {
    const { versions, startPort } = req.body;
    let port = startPort || 5200;
    for (const v of versions) {
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
        const stats = await pidusage(proc.pid);
        res.json({ cpu: stats.cpu, memory: stats.memory });
    } catch (err) { res.json({}); }
});

app.get('/api/config/:versionId', async (req, res) => {
    try {
        const p = path.join(LABS_DIR, req.params.versionId, 'package.json');
        if (fs.existsSync(p)) res.json({ packageJson: JSON.parse(await fs.readFile(p, 'utf-8')) });
        else res.json({});
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/env/:versionId', async (req, res) => {
    try {
        const p = path.join(LABS_DIR, req.params.versionId, '.env');
        if (fs.existsSync(p)) {
             const content = await fs.readFile(p, 'utf-8');
             const vars = {};
             content.split('\n').forEach(l => { const [k,v] = l.split('='); if(k) vars[k.trim()] = v ? v.trim() : ''; });
             res.json(vars);
        } else res.json({});
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/env/:versionId', async (req, res) => {
    try {
        const p = path.join(LABS_DIR, req.params.versionId, '.env');
        const lines = Object.entries(req.body).map(([k,v]) => `${k}=${v}`).join('\n');
        await fs.writeFile(p, lines, 'utf-8');
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/snapshots/:versionId', async (req, res) => {
    try {
        const { versionId } = req.params;
        const { name } = req.body;
        const src = path.join(LABS_DIR, versionId);
        const dest = path.join(LABS_DIR, '_Snapshots', versionId, name || `snap_${Date.now()}`);
        if (fs.existsSync(src)) {
            await fs.copy(src, dest, { filter: s => !s.includes('node_modules') });
            await fs.writeJson(path.join(dest, '.snapshot-meta.json'), { id: name, timestamp: Date.now() });
            res.json({ success: true });
        } else res.status(404).json({ error: 'Not found' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/snapshots/:versionId', async (req, res) => {
    try {
        const snapDir = path.join(LABS_DIR, '_Snapshots', req.params.versionId);
        if(!fs.existsSync(snapDir)) return res.json({ snapshots: [] });
        const items = await fs.readdir(snapDir);
        const snaps = [];
        for(const item of items) {
             if(fs.existsSync(path.join(snapDir, item, '.snapshot-meta.json'))) {
                 snaps.push(await fs.readJson(path.join(snapDir, item, '.snapshot-meta.json')));
             }
        }
        res.json({ snapshots: snaps });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/snapshots/:versionId/restore', async (req, res) => {
    try {
        const { versionId } = req.params;
        const { snapshotId } = req.body;
        await stopProcess(versionId);
        const snap = path.join(LABS_DIR, '_Snapshots', versionId, snapshotId);
        const dest = path.join(LABS_DIR, versionId);
        if(fs.existsSync(snap)) {
            await fs.emptyDir(dest);
            await fs.copy(snap, dest, { filter: s => !s.includes('.snapshot-meta.json') });
            res.json({ success: true });
        } else res.status(404).json({ error: 'Snapshot not found' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/clone', async (req, res) => {
    try {
        const { sourceVersion, targetVersion, includeDeps } = req.body;
        const src = path.join(LABS_DIR, sourceVersion);
        const dest = path.join(LABS_DIR, targetVersion);
        if(fs.existsSync(src) && !fs.existsSync(dest)) {
            await fs.copy(src, dest, { 
                filter: s => includeDeps ? true : (!s.includes('node_modules') && !s.includes('.git')) 
            });
            const pkg = path.join(dest, 'package.json');
            if(fs.existsSync(pkg)) {
                const j = await fs.readJson(pkg);
                j.name = targetVersion;
                await fs.writeJson(pkg, j, { spaces: 2 });
            }
            res.json({ success: true, targetVersion });
        } else res.status(400).json({ error: 'Invalid clone operation' });
    } catch (e) { res.status(500).json({ error: e.message }); }
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
    console.log(`📡 Lab Dashboard API running on http://localhost:${PORT}`);
    broadcastLog('system', `🚀 Server started on port ${PORT}`, 'success');
});
"""

final_text = base_code + new_code

with open(path, 'w', encoding='utf-8') as f:
    f.write(final_text)

print("Server.js overwritten and repaired.")
