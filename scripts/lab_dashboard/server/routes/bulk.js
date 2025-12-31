const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // BULK OPERATIONS
    router.post('/stop-all', (req, res) => {
        try {
            activeProcesses.forEach((proc, id) => {
                dependencies.stopProcess(id);
            });
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/start-all', async (req, res) => {
        // This is dangerous, maybe just a placeholder or start selected
        const { versions } = req.body; // Expect array of ids
        if (!versions || !Array.isArray(versions)) return res.status(400).json({ error: 'Versions array required' });

        for (const v of versions) {
            try {
                // simple port assignment logic needed or rely on auto
                await dependencies.startProcess(v, 0);
            } catch (e) {
                broadcastLog('system', `Bulk start failed for ${v}: ${e.message}`, 'error');
            }
        }
        res.json({ success: true });
    });

    return router;
};
