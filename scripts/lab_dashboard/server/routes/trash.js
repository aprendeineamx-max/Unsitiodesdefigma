const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // TRASH MANAGEMENT
    const TRASH_DIR = path.join(LABS_DIR, '_Trash');

    router.get('/list', (req, res) => {
        if (!fs.existsSync(TRASH_DIR)) return res.json([]);
        try {
            const items = fs.readdirSync(TRASH_DIR).map(id => ({ id, type: 'directory' })); // Assuming folders
            res.json(items);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/empty', (req, res) => {
        try {
            fs.emptyDirSync(TRASH_DIR);
            broadcastState();
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/restore', (req, res) => {
        const { version } = req.body;
        try {
            const src = path.join(TRASH_DIR, version);
            const dest = path.join(LABS_DIR, version);
            if (fs.existsSync(src)) {
                if (fs.existsSync(dest)) return res.status(409).json({ error: 'Already exists in active envs' });
                fs.moveSync(src, dest);
                broadcastState();
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Not found in Trash' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
