const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // TRASH MANAGEMENT
    const TRASH_DIR = path.join(LABS_DIR, '_Trash');

    router.get('/', (req, res) => {
        if (!fs.existsSync(TRASH_DIR)) return res.json([]);
        try {
            const items = fs.readdirSync(TRASH_DIR).map(name => ({ name, type: 'directory' })); // Assuming folders
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

    return router;
};
