
const { exec } = require('child_process');

// ==========================================
// DEPS & TERMINAL
// ==========================================
app.get('/api/deps/analyze', async (req, res) => {
    try {
        // Global analysis (root) or specific? Assuming root for now
        // Or per version? The law says '/api/deps/analyze'.
        // Let's analyze the dashboard itself + list versions
        const packageJson = await fs.readJson(path.join(__dirname, 'package.json'));
        res.json({ dependencies: packageJson.dependencies || {}, devDependencies: packageJson.devDependencies || {} });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/deps/install', async (req, res) => {
    try {
        const { versionId, package } = req.body;
        const cwd = versionId ? path.join(LABS_DIR, versionId) : __dirname;
        if (!fs.existsSync(cwd)) return res.status(404).json({ error: 'Target not found' });

        const cmd = package ? `npm.cmd install ${package}` : 'npm.cmd install';

        await new Promise((resolve, reject) => {
            exec(cmd, { cwd }, (error, stdout, stderr) => {
                if (error) reject(error);
                else resolve({ stdout, stderr });
            });
        });

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/terminal/exec', async (req, res) => {
    try {
        const { command, cwd } = req.body;
        // Security: Very dangerous. Only for verified local use.
        if (!command) return res.status(400).json({ error: 'No command' });

        const targetDir = cwd ? path.resolve(LABS_DIR, cwd) : __dirname;

        await new Promise((resolve, reject) => {
            exec(command, { cwd: targetDir }, (error, stdout, stderr) => {
                // We resolve even on error to return stderr
                resolve({
                    stdout: stdout || '',
                    stderr: stderr || (error ? error.message : ''),
                    failed: !!error
                });
            });
        }).then(output => res.json(output));

    } catch (e) { res.status(500).json({ error: e.message }); }
});

// START WATCHER (Stub for Law 104)
app.post('/api/watch/start', (req, res) => {
    res.json({ success: true, message: 'Watcher started (simulated)' });
});

app.post('/api/watch/stop', (req, res) => {
    res.json({ success: true, message: 'Watcher stopped' });
});
