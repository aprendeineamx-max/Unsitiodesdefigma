const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // FILE SYSTEM API
    router.get('/:version/files', (req, res) => {
        const { version } = req.params;
        const subPath = req.query.path || '';
        const targetDir = path.join(LABS_DIR, version, subPath);

        if (!fs.existsSync(targetDir)) return res.status(404).json({ error: 'Not found' });

        try {
            const dirents = fs.readdirSync(targetDir, { withFileTypes: true });
            const files = dirents.map(dirent => ({
                name: dirent.name,
                isDirectory: dirent.isDirectory(),
                size: dirent.isDirectory() ? 0 : fs.statSync(path.join(targetDir, dirent.name)).size
            }));
            res.json(files);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
