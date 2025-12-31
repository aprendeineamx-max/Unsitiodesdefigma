const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // ZIP MANAGEMENT
    router.post('/start', async (req, res) => {
        const { version, port } = req.body;
        if (!version) return res.status(400).json({ error: 'Version required' });
        try {
            await dependencies.startProcess(version, port);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/stop', async (req, res) => {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'Version required' });
        try {
            dependencies.stopProcess(version);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/archive', async (req, res) => {
        const { version } = req.body;
        // Basic impl: move to _Archive
        try {
            const src = path.join(LABS_DIR, version);
            const dest = path.join(LABS_DIR, '_Archive', version);
            if (fs.existsSync(src)) {
                fs.ensureDirSync(path.join(LABS_DIR, '_Archive'));
                fs.moveSync(src, dest);
                broadcastState();
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Similar for trash/delete but simpler for now to just get start/stop working
    router.post('/trash', async (req, res) => {
        const { version } = req.body;
        try {
            const src = path.join(LABS_DIR, version);
            const dest = path.join(LABS_DIR, '_Trash', version);
            if (fs.existsSync(src)) {
                fs.ensureDirSync(path.join(LABS_DIR, '_Trash'));
                fs.moveSync(src, dest);
                broadcastState();
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    router.post('/delete', async (req, res) => {
        const { version } = req.body;
        try {
            const src = path.join(LABS_DIR, version);
            if (fs.existsSync(src)) {
                fs.removeSync(src);
                broadcastState();
                res.json({ success: true });
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    return router;
};
