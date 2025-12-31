const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // FILE SYSTEM API
    // List files
    router.get('/', (req, res) => {
        const { versionId, path: subPath } = req.query;
        if (!versionId) return res.status(400).json({ error: 'Version ID required' });

        const targetDir = path.join(LABS_DIR, versionId, subPath || '');
        if (!fs.existsSync(targetDir)) return res.json({ items: [] }); // Start empty, don't 404

        try {
            const dirents = fs.readdirSync(targetDir, { withFileTypes: true });
            const items = dirents.map(dirent => ({
                name: dirent.name,
                path: path.join(subPath || '', dirent.name).replace(/\\/g, '/'),
                type: dirent.isDirectory() ? 'dir' : 'file',
                size: dirent.isDirectory() ? 0 : fs.statSync(path.join(targetDir, dirent.name)).size
            }));

            // Sort: directories first, then files
            items.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'dir' ? -1 : 1;
            });

            res.json({ items });
        } catch (err) {
            console.error('File list error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // Read file
    router.get('/read', (req, res) => {
        const { versionId, path: filePath } = req.query;
        if (!versionId || !filePath) return res.status(400).json({ error: 'Missing params' });

        const fullPath = path.join(LABS_DIR, versionId, filePath);
        if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found' });

        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            res.json({ content });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Write file
    router.post('/write', (req, res) => {
        const { versionId, path: filePath, content } = req.body;
        if (!versionId || !filePath) return res.status(400).json({ error: 'Missing params' });

        const fullPath = path.join(LABS_DIR, versionId, filePath);
        try {
            fs.writeFileSync(fullPath, content, 'utf8');
            broadcastLog(versionId, `💾 Saved ${filePath}`, 'success');
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
