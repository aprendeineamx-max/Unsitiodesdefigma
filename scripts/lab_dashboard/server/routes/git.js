const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // GIT OPS CENTER
    const simpleGit = require('simple-git');
    const git = simpleGit(LABS_DIR); // Assuming Labs dir is a repo, or the root is

    router.get('/status', async (req, res) => {
        try {
            const status = await git.status();
            res.json(status);
        } catch (err) {
            res.status(500).json({ error: 'Git not active here' });
        }
    });

    router.post('/pull', async (req, res) => {
        try {
            const result = await git.pull();
            broadcastLog('system', `Git Pull: ${result.summary.changes} changes`, 'success');
            res.json(result);
        } catch (err) {
            broadcastLog('system', `Git Pull Failed: ${err.message}`, 'error');
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
