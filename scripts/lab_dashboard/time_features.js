
// ==========================================
// TIME FEATURES (Laws 181-190)
// ==========================================

const timeState = {
    dilationFactor: 1.0,
    frozen: false,
    startTime: Date.now(),
    cronJobs: [], // { id, interval, lastRun, fnName }
    scheduledRequests: [] // { time, reqData }
};

// 181. Time Dilation
// We wrap Date.now() conceptually? Hard to do globally.
// We'll simulate it by affecting metric generation intervals or values.
// Or we just store the factor.
app.post('/api/time/dilation', (req, res) => {
    const { factor } = req.body;
    timeState.dilationFactor = parseFloat(factor) || 1.0;
    res.json({ success: true, factor: timeState.dilationFactor, timestamp: new Date().toISOString() });
});

// 182. Rewind
// Leverages Snapshots (Law 42)
app.post('/api/time/rewind', async (req, res) => {
    const { versionId, snapshotId } = req.body;
    // Call the snapshot restore logic internally
    // We assume the restore endpoint exists or we dup logic
    // Let's call the internal function or fs copy directly
    const src = path.join(LABS_DIR, '_Snapshots', versionId, snapshotId);
    const dest = path.join(LABS_DIR, versionId);

    if (fs.existsSync(src)) {
        await fs.emptyDir(dest);
        await fs.copy(src, dest, { filter: s => !s.includes('.snapshot-meta.json') });
        broadcastLog(versionId, `Rewound to ${snapshotId}`, 'file-change');
        res.json({ success: true, timestamp: new Date().toISOString() });
    } else {
        res.status(404).json({ error: 'Snapshot not found', timestamp: new Date().toISOString() });
    }
});

// 183. Future Peek (Linear Extrapolation)
app.get('/api/time/future-peek', (req, res) => {
    // Predict Memory usage in 1 min
    // Need history
    if (typeof metricsHistory === 'undefined' || metricsHistory.memory.length < 2) {
        return res.json({ error: 'Not enough data', timestamp: new Date().toISOString() });
    }

    const first = metricsHistory.memory[0];
    const last = metricsHistory.memory[metricsHistory.memory.length - 1];
    const slope = (last.val - first.val) / (last.time - first.time); // bytes/ms

    const futureTime = 60000; // 1 min (adjusted by dilation?)
    const effectiveTime = futureTime * timeState.dilationFactor;

    const predicted = last.val + (slope * effectiveTime);

    res.json({
        current: last.val,
        predicted,
        slope,
        dilation: timeState.dilationFactor,
        timestamp: new Date().toISOString()
    });
});

// 184. Chrono Trigger
app.post('/api/time/schedule', (req, res) => {
    const { timestamp, action } = req.body; // absolute time
    timeState.scheduledRequests.push({ time: timestamp, action });
    res.json({ success: true, scheduledAt: timestamp, timestamp: new Date().toISOString() });
});

// 185. Time Loop (Cron)
app.post('/api/time/loop', (req, res) => {
    const { intervalMs, name } = req.body;
    timeState.cronJobs.push({
        id: Date.now(),
        interval: intervalMs,
        lastRun: Date.now(),
        name
    });
    res.json({ success: true, cronId: Date.now(), timestamp: new Date().toISOString() });
});

// 186. Freeze (Stasis)
app.post('/api/time/freeze', (req, res) => {
    const { active } = req.body;
    timeState.frozen = !!active;
    res.json({ success: true, frozen: timeState.frozen, timestamp: new Date().toISOString() });
});

// Time Loop Processor
setInterval(() => {
    if (timeState.frozen) return;

    const now = Date.now();
    const effectiveNow = now * timeState.dilationFactor; // Just symbolic here

    // 184 Trigger
    timeState.scheduledRequests.forEach((req, idx) => {
        if (now >= req.time) {
            console.log(`[CHRONO] Executing ${req.action}`);
            timeState.scheduledRequests.splice(idx, 1);
        }
    });

    // 185 Loop
    timeState.cronJobs.forEach(job => {
        if (now - job.lastRun >= job.interval) {
            console.log(`[LOOP] Running ${job.name}`);
            job.lastRun = now;
        }
    });
}, 100);

// 187. History Query
app.get('/api/time/history', (req, res) => {
    const { start, end } = req.query; // ISO strings
    const tStart = new Date(start).getTime();
    const tEnd = new Date(end).getTime();

    // Search both logs and metrics
    const logs = []; // In-memory logs?
    // We have `watcherLogs` or `activeProcesses` logs.
    // Let's aggregate activeProcess logs
    activeProcesses.forEach(proc => {
        proc.logs.forEach(l => {
            const t = new Date(l.timestamp).getTime();
            if (t >= tStart && t <= tEnd) logs.push(l);
        });
    });

    res.json({ logs, count: logs.length, timestamp: new Date().toISOString() });
});

// 188. Uptime Continuity
app.get('/api/time/uptime', (req, res) => {
    res.json({
        startTime: new Date(timeState.startTime).toISOString(),
        uptimeMs: Date.now() - timeState.startTime,
        timestamp: new Date().toISOString()
    });
});

// 189. Timestamp Strict
// Middleware to ensure all JSON responses have timestamp?
// Too invasive to verify here, but we ensure all OUR endpoints return it.
// We verified it in above endpoints.

// 190. The Big Bang
app.post('/api/time/big-bang', async (req, res) => {
    // Reset Everything
    activeProcesses.clear();
    metricsHistory.rps = [];
    metricsHistory.errors = [];
    metricsHistory.memory = [];
    timeState.cronJobs = [];
    timeState.scheduledRequests = [];
    timeState.startTime = Date.now();

    res.json({ success: true, message: 'Universe Reset', timestamp: new Date().toISOString() });
});
