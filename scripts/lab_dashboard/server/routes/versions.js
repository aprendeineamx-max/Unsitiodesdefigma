const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path, getVersionsState } = dependencies;

    // API ROUTES
    router.get('/versions', (req, res) => {
        const versions = getVersionsState();
        res.json(versions);
    });

    return router;
};
