const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // SNAPSHOTS & TIME TRAVEL
    const SNAPSHOTS_DIR = path.join(LABS_DIR, '_Snapshots');

    router.get('/', (req, res) => {
        if (!fs.existsSync(SNAPSHOTS_DIR)) return res.json([]);
        try {
            // Logic to list snapshots
            const items = fs.readdirSync(SNAPSHOTS_DIR);
            res.json(items);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
