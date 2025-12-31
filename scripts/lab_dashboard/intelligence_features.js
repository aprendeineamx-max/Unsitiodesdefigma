
// ==========================================
// INTELLIGENCE FEATURES (Laws 141-150)
// ==========================================

const metricsHistory = {
    rps: [],
    errors: [],
    memory: []
};

// 142. Traffic Analysis (RPS Calculation)
app.use((req, res, next) => {
    metricsHistory.rps.push(Date.now());
    // Cleanup old RPS data (> 1 min)
    const now = Date.now();
    metricsHistory.rps = metricsHistory.rps.filter(t => t > now - 60000);
    next();
});

// 143. Error Rate Tracking & 145. Log Analysis
const originalJson = res.json;
// We can't easily intercept res.status without a wrapper, but we can use a middleware for errors
// actually, standard express error handler is better, but let's track 4xx/5xx in a finish listener
app.use((req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode >= 400) {
            metricsHistory.errors.push({ time: Date.now(), status: res.statusCode, path: req.path });
        }
        // Cleanup old errors
        const now = Date.now();
        metricsHistory.errors = metricsHistory.errors.filter(e => e.time > now - 60000);
    });
    next();
});

// 146. Memory Trend
setInterval(() => {
    const mu = process.memoryUsage().heapUsed;
    metricsHistory.memory.push({ time: Date.now(), val: mu });
    if (metricsHistory.memory.length > 30) metricsHistory.memory.shift(); // Keep last 30 pts (60s)
}, 2000);

// ENDPOINTS

// 141. Deep Metrics
app.get('/api/metrics/high-res', async (req, res) => {
    // Event Loop Lag (Approximated)
    const start = Date.now();
    setTimeout(() => {
        const lag = Date.now() - start;
        const memory = process.memoryUsage();
        res.json({
            lag, // Should be ~0 if idle, higher if busy
            gc: { ...memory }
        });
    }, 0);
});

// 144. Predictive Alert (Scale Warning)
// & 142, 143, 146 Exposure
app.get('/api/intelligence/dashboard', (req, res) => {
    const rps = metricsHistory.rps.length / 60; // Average over last minute
    const errorRate = metricsHistory.errors.length;

    // 146 Slope
    let memSlope = 0;
    if (metricsHistory.memory.length > 1) {
        const first = metricsHistory.memory[0];
        const last = metricsHistory.memory[metricsHistory.memory.length - 1];
        memSlope = (last.val - first.val) / (last.time - first.time); // bytes per ms
    }

    const alerts = [];
    if (rps > 100) alerts.push("SCALE WARNING: RPS > 100");
    if (memSlope > 1000) alerts.push("LEAK WARNING: Memory rising fast");

    res.json({
        rps,
        errorRate,
        memSlope,
        alerts,
        activeProcesses: activeProcesses.size
    });
});

// 147. Zombie Hunter
app.post('/api/intelligence/zombie-hunt', async (req, res) => {
    // Scan tasklist for node.exe, compare PIDs with activeProcesses
    // Windows specific
    exec('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH', (err, stdout, stderr) => {
        if (err) return res.status(500).json({ error: err.message });

        const knownPids = new Set([...activeProcesses.values()].map(p => p.pid));
        knownPids.add(process.pid); // Don't kill self

        const zombies = [];
        const lines = stdout.split('\r\n');

        // This is risky if we have other node apps (like VSCode extensions).
        // Intelligence: We only list them, strict mode would kill.
        // For Law 147 we just "Auto-scan".

        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length > 1) {
                const pid = parseInt(parts[1].replace(/"/g, ''));
                if (!isNaN(pid) && !knownPids.has(pid)) {
                    zombies.push(pid);
                }
            }
        });

        res.json({ zombies, count: zombies.length });
    });
});

// 148. Network Map
app.get('/api/intelligence/network-map', (req, res) => {
    const nodes = [];
    nodes.push({ id: 'brain', type: 'server', port: process.env.PORT || 3000 });

    activeProcesses.forEach((proc, id) => {
        nodes.push({ id, type: 'atom', port: proc.port, pid: proc.pid });
    });

    res.json({ nodes, edges: nodes.filter(n => n.id !== 'brain').map(n => ({ from: 'brain', to: n.id })) });
});

// 149. Diff Engine (Simple count compare)
app.post('/api/intelligence/diff', async (req, res) => {
    const { idA, idB } = req.body;
    const dirA = path.join(LABS_DIR, idA);
    const dirB = path.join(LABS_DIR, idB);

    if (!fs.existsSync(dirA) || !fs.existsSync(dirB)) return res.status(404).json({ error: 'Versions not found' });

    const countA = fs.readdirSync(dirA).length;
    const countB = fs.readdirSync(dirB).length;

    res.json({ idA, countA, idB, countB, delta: Math.abs(countA - countB) });
});

// 150. Self-Report
app.get('/api/intelligence/report', (req, res) => {
    const report = `
# SYSTEM STATUS REPORT
**Timestamp:** ${new Date().toISOString()}
**Uptime:** ${process.uptime()}s

## Metrics
- **RPS (1m):** ${(metricsHistory.rps.length / 60).toFixed(2)}
- **Errors (1m):** ${metricsHistory.errors.length}
- **Active Atoms:** ${activeProcesses.size}
- **Memory:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB

## Alerts
${metricsHistory.rps.length / 60 > 100 ? '- [WARNING] High Load' : '- System Nominal'}
    `;
    res.json({ report });
});
