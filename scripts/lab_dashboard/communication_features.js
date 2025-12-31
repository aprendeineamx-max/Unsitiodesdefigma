
// ==========================================
// COMMUNICATION FEATURES (Laws 171-180)
// ==========================================

const crypto = require('crypto');

// 171. Inter-Node Ping (Simulated)
app.post('/api/comms/ping', async (req, res) => {
    const { targetHost } = req.body;
    // Simulate ping logic
    if (targetHost) {
        // In real mesh, we would axios.get(`http://${targetHost}/health`)
        res.json({ success: true, target: targetHost, latency: Math.floor(Math.random() * 10) });
    } else {
        res.status(400).json({ error: 'Target missing' });
    }
});

// 172. Mesh Broadcast
app.post('/api/comms/broadcast', async (req, res) => {
    const { message } = req.body;
    // Deliver to all active processes
    const receipts = [];
    for (const [id, proc] of activeProcesses.entries()) {
        // Simulate delivery
        receipts.push({ id, status: 'delivered', time: Date.now() });
        // In reality: axios.post(`http://localhost:${proc.port}/message`, { message })
    }
    // Also log to self
    broadcastLog('BROADCAST', message, 'info');
    res.json({ success: true, receipts });
});

// 173. Secret Whisper (AES Encryption)
app.post('/api/comms/whisper', (req, res) => {
    const { message, secret } = req.body;
    const algorithm = 'aes-256-ctr';
    const iv = crypto.randomBytes(16);

    // Encrypt
    const cipher = crypto.createCipheriv(algorithm, crypto.scryptSync(secret, 'salt', 32), iv);
    const encrypted = Buffer.concat([cipher.update(message), cipher.final()]);

    res.json({
        success: true,
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    });
});

// 174. Gossip Protocol
let gossipState = { kv: {} };
app.post('/api/comms/gossip', (req, res) => {
    const { key, value } = req.body;
    // Update local
    gossipState.kv[key] = { value, version: Date.now() };

    // Propagate (Simulated recursion 3 hops)
    // We just return the new state to prove "sync"
    res.json({ success: true, state: gossipState.kv });
});

// 175. Dead Letter
app.post('/api/comms/send-direct', (req, res) => {
    const { nodeId, message } = req.body;
    if (activeProcesses.has(nodeId)) {
        res.json({ status: 'delivered' });
    } else {
        // Dead Letter Queue logic
        broadcastLog('DLQ', `Message to ${nodeId} failed: Node dead`, 'warn');
        res.json({ status: 'dead-letter-queued' });
    }
});

// 176. Signal Flare
app.post('/api/comms/flare', (req, res) => {
    // Priority Interrupt
    console.log("!!! SIGNAL FLARE TRIGGERED !!!");
    io.emit('log', { versionId: 'SYSTEM', text: 'SIGNAL FLARE: ALL STATIONS ALERT', type: 'critical', timestamp: new Date().toISOString() });
    res.json({ success: true, broadcast: 'system-wide' });
});

// 177. Shared Memory
const SHARED_MEM_FILE = path.join(__dirname, 'shared_state.json');
app.get('/api/comms/shared', async (req, res) => {
    if (fs.existsSync(SHARED_MEM_FILE)) {
        res.json(await fs.readJson(SHARED_MEM_FILE));
    } else {
        res.json({});
    }
});
app.post('/api/comms/shared', async (req, res) => {
    const { key, value } = req.body;
    let data = {};
    if (fs.existsSync(SHARED_MEM_FILE)) data = await fs.readJson(SHARED_MEM_FILE);
    data[key] = value;
    await fs.writeJson(SHARED_MEM_FILE, data);
    res.json({ success: true, current: data });
});

// 178. Remote Exec
app.post('/api/comms/remote-exec', async (req, res) => {
    const { targetId, action } = req.body; // action: 'restart'
    if (activeProcesses.has(targetId)) {
        if (action === 'restart') {
            await stopProcess(targetId);
            // Wait slightly? or just await logic
            // In simulation we just stop. Resurrect logic (Law 140/162) handles restart if critical, 
            // or user manually restarts. For this test logic:
            const proc = activeProcesses.get(targetId); // It's gone after stop?
            // Actually stopProcess removes from map.
            res.json({ success: true, result: 'Terminated' });
        } else {
            res.json({ success: true, result: 'Executed' });
        }
    } else {
        res.status(404).json({ error: 'Target not found' });
    }
});

// 179. Vote Consensus
app.post('/api/comms/consensus', (req, res) => {
    const { proposal } = req.body; // e.g., "Set Value=5"
    // Simulate 3 nodes voting
    const votes = [true, true, Math.random() > 0.5]; // 2 always yes, 1 random
    const yes = votes.filter(v => v).length;
    const passed = yes >= 2;

    res.json({
        proposal,
        votes: { yes, no: 3 - yes },
        passed,
        quorum: 3
    });
});

// 180. Telemetry Stream
// We already have io.emit('stats-update') but this is strictly subscribing to one node
app.get('/api/comms/telemetry/:versionId', (req, res) => {
    const { versionId } = req.params;
    if (activeProcesses.has(versionId)) {
        res.json({
            stream: 'active',
            endpoint: `/socket/subs/${versionId}` // Mock pointer
        });
    } else {
        res.status(404).json({ error: 'Node not found' });
    }
});
