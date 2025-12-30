const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');

// ... existing code ...

app.post('/api/git/log', async (req, res) => {
    const { versionId } = req.body;
    try {
        const git = getGit(versionId);
        const log = await git.log();
        res.json({ success: true, log });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/git/config', async (req, res) => {
    const { versionId, key, value } = req.body;
    try {
        const git = getGit(versionId);
        await git.addConfig(key, value);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ... existing code ...
