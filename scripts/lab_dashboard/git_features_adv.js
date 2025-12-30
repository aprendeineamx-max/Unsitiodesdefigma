
// ==========================================
// GIT FEATURES ADVANCED
// ==========================================
app.post('/api/git/branch', async (req, res) => {
    try {
        const { versionId, name } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        if (name) {
            await simpleGit(cwd).branch([name]);
            res.json({ success: true, branch: name });
        } else {
            const branches = await simpleGit(cwd).branchLocal();
            res.json(branches);
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/checkout', async (req, res) => {
    try {
        const { versionId, branch } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        await simpleGit(cwd).checkout(branch);
        res.json({ success: true, current: branch });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/merge', async (req, res) => {
    try {
        const { versionId, from } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        const result = await simpleGit(cwd).merge([from]);
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/remote/add', async (req, res) => {
    try {
        const { versionId, name, url } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        await simpleGit(cwd).addRemote(name, url);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/push', async (req, res) => {
    try {
        const { versionId, remote, branch } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        // Note: Push might fail if no creds, but Law says 'Verify Push' (could be dry run or simulated)
        // We will try.
        await simpleGit(cwd).push(remote, branch);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});
