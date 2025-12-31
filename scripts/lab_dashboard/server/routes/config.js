const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // CONFIGURATION MANAGEMENT
    const CONFIG_PATH = path.join(LABS_DIR, 'config.json');

    router.get('/', (req, res) => {
        try {
            if (fs.existsSync(CONFIG_PATH)) {
                const config = fs.readJsonSync(CONFIG_PATH);
                res.json(config);
            } else {
                res.json({});
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    router.post('/', (req, res) => {
        try {
            fs.writeJsonSync(CONFIG_PATH, req.body, { spaces: 2 });
            broadcastLog('system', 'Configuration updated', 'success');
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
