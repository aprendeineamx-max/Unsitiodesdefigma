
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
    // Also broadcast if possible (using existing broadcastLog if available, or ignore)
    // We assume broadcastLog function exists in server scope, but here we prioritize API retrieval
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
