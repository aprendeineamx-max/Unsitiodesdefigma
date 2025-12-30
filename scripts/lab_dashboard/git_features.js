
// ==========================================
// GIT FEATURES
// ==========================================
app.post('/api/git/init', async (req, res) => {
    try {
        const { versionId } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        if (!fs.existsSync(cwd)) return res.status(404).json({ error: 'Version not found' });

        await simpleGit(cwd).init();
        // Add config locally strictly for this repo to avoid global config issues
        await simpleGit(cwd).addConfig('user.name', 'LabAutomaton');
        await simpleGit(cwd).addConfig('user.email', 'lab@automaton.local');

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/status', async (req, res) => {
    try {
        const { versionId } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        if (!fs.existsSync(cwd) || !fs.existsSync(path.join(cwd, '.git')))
            return res.json({ not_git: true });

        const status = await simpleGit(cwd).status();
        res.json(status);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/commit', async (req, res) => {
    try {
        const { versionId, message } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        const git = simpleGit(cwd);
        await git.add('.');
        const result = await git.commit(message || 'Update');
        res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/git/log', async (req, res) => {
    try {
        const { versionId } = req.body;
        const cwd = path.join(LABS_DIR, versionId);
        const log = await simpleGit(cwd).log();
        res.json(log);
    } catch (e) { res.status(500).json({ error: e.message }); }
});
