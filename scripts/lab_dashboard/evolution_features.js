
// ==========================================
// EVOLUTION FEATURES (Laws 161-170)
// ==========================================

// Global State for Evolution
const evolutionState = {
    safeMode: false,
    logLevel: 'INFO',
    adaptations: []
};

// 161. Hot Patch (Dynamic Logic Handler)
let dynamicLogic = (req, res) => res.json({ msg: 'Original Logic' });
app.get('/api/evolution/hot-logic', (req, res) => dynamicLogic(req, res));

app.post('/api/evolution/hot-patch', (req, res) => {
    const { code } = req.body; // e.g., "res.json({ msg: 'Patched Logic' })"
    try {
        // Unsafe but necessary for "Hot Patch" simulation
        const newFunc = new Function('req', 'res', code);
        dynamicLogic = newFunc;
        logAdaptation('Hot Patch Applied');
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 162. Auto-Repair (Simulated Heart)
const CRITICAL_FILE = path.join(LABS_DIR, 'heart.sys');
// Ensure it exists initially
if (!fs.existsSync(CRITICAL_FILE)) fs.writeFileSync(CRITICAL_FILE, 'ALIVE');

app.post('/api/evolution/damage', async (req, res) => {
    if (fs.existsSync(CRITICAL_FILE)) await fs.unlink(CRITICAL_FILE);
    res.json({ status: 'DAMAGED' });
});

app.post('/api/evolution/auto-repair', async (req, res) => {
    if (!fs.existsSync(CRITICAL_FILE)) {
        logAdaptation('Critical File Restored');
        await fs.writeFile(CRITICAL_FILE, 'ALIVE (RESTORED)');
        res.json({ success: true, repaired: true });
    } else {
        res.json({ success: true, repaired: false });
    }
});

// 163. Port Hopper
app.post('/api/evolution/smart-start', async (req, res) => {
    const { versionId, startPort } = req.body;
    let port = startPort || 4000;
    const maxTries = 5;

    for (let i = 0; i < maxTries; i++) {
        const isBusy = await new Promise(r => {
            const server = require('net').createServer();
            server.once('error', () => r(true));
            server.once('listening', () => { server.close(); r(false); });
            server.listen(port);
        });

        if (!isBusy) {
            await startProcess(versionId, port);
            logAdaptation(`Port Hopper used ${port}`);
            return res.json({ success: true, port });
        }
        port++;
    }
    res.status(500).json({ error: 'No ports found' });
});

// 164. Version Fork
app.post('/api/evolution/fork', async (req, res) => {
    const { sourceId, newId } = req.body;
    const src = path.join(LABS_DIR, sourceId);
    const dest = path.join(LABS_DIR, newId);

    if (!fs.existsSync(src)) return res.status(404).json({ error: 'Source not found' });

    await fs.copy(src, dest, { filter: s => !s.includes('node_modules') });

    const pkgPath = path.join(dest, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        const vParts = (pkg.version || '1.0.0').split('.');
        vParts[2] = parseInt(vParts[2]) + 1;
        pkg.version = vParts.join('.');
        pkg.name = newId;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    logAdaptation(`Forked ${sourceId} to ${newId}`);
    res.json({ success: true, newVersion: newId });
});

// 165. Dependency Evolution
app.post('/api/evolution/evolve-deps', async (req, res) => {
    const { versionId, depName } = req.body;
    const p = path.join(LABS_DIR, versionId, 'package.json');
    if (fs.existsSync(p)) {
        const pkg = await fs.readJson(p);
        pkg.dependencies = pkg.dependencies || {};
        if (!pkg.dependencies[depName]) {
            pkg.dependencies[depName] = 'latest';
            await fs.writeJson(p, pkg, { spaces: 2 });
            logAdaptation(`Evolved dependency: ${depName}`);
            // Logic to run npm install would go here
            return res.json({ success: true, evolved: true });
        }
    }
    res.json({ success: false });
});

// 166. Config Adapt & 167. Chaos Shield
// Middleware for adaptation
app.use((req, res, next) => {
    // 167 Chaos Shield
    if (evolutionState.safeMode) {
        // Reject non-critical
        if (!req.path.includes('/evolution') && !req.path.includes('/system')) {
            return res.status(503).json({ error: 'Safe Mode Active' });
        }
    }
    next();
});

// Background Adapter (166 & 168)
setInterval(() => {
    // 166 Config Adapt
    if (typeof metricsHistory !== 'undefined') {
        const recentErrors = metricsHistory.errors.length;
        if (recentErrors > 5 && evolutionState.logLevel !== 'DEBUG') {
            evolutionState.logLevel = 'DEBUG';
            logAdaptation('LogLevel scaled to DEBUG due to errors');
        } else if (recentErrors === 0 && evolutionState.logLevel === 'DEBUG') {
            evolutionState.logLevel = 'INFO';
        }
    }

    // 168 Resource Balancer
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPercent = ((totalMem - freeMem) / totalMem) * 100;

    if (usedPercent > 80 && !evolutionState.safeMode) {
        evolutionState.safeMode = true;
        logAdaptation('Chaos Shield Activated (High Memory)');
        // Kill idle processes?
        activeProcesses.forEach((proc, id) => {
            // Kill if older than 1 hour? For now just log
            // if (Date.now() - proc.startTime > 3600000) stopProcess(id);
        });
    } else if (usedPercent < 60 && evolutionState.safeMode) {
        evolutionState.safeMode = false;
        logAdaptation('Chaos Shield Deactivated');
    }
}, 5000);

// 169. Code Mutator
app.post('/api/evolution/mutate', async (req, res) => {
    const { versionId, file } = req.body;
    const fp = path.join(LABS_DIR, versionId, file);
    if (fs.existsSync(fp)) {
        await fs.appendFile(fp, `\n// VERIFIED_BY_EVOLUTION_${Date.now()}\n`);
        logAdaptation(`Mutated ${file}`);
        res.json({ success: true });
    } else res.status(404).json({ error: 'File not found' });
});

// 170. Survival Log - Helpers
function logAdaptation(msg) {
    const entry = { time: new Date().toISOString(), event: msg };
    evolutionState.adaptations.push(entry);
    console.log(`[EVOLUTION] ${msg}`);

    // Write disk
    const logPath = path.join(__dirname, 'logs', 'evolution.json');
    fs.ensureDirSync(path.dirname(logPath));
    // Read existing or init
    let logs = [];
    try {
        if (fs.existsSync(logPath)) logs = fs.readJsonSync(logPath);
    } catch (e) { }
    logs.push(entry);
    fs.writeJsonSync(logPath, logs, { spaces: 2 });
}

app.get('/api/evolution/log', (req, res) => {
    res.json({
        state: evolutionState,
        history: evolutionState.adaptations
    });
});
