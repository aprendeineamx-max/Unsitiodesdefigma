const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // HEALTH & MONITORING
    const os = require('os');
    const pidusage = require('pidusage');

    router.get('/', (req, res) => {
        res.json({ status: 'ok', uptime: process.uptime() });
    });

    router.get('/stats', async (req, res) => {
        try {
            const stats = await pidusage(process.pid);
            res.json({
                cpu: stats.cpu,
                memory: stats.memory,
                totalmem: os.totalmem(),
                freemem: os.freemem(),
                uptime: process.uptime()
            });
        } catch (err) {
            res.json({ error: err.message });
        }
    });

    return router;
};
