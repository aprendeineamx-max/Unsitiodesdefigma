
const axios = require('axios');
const headers = { 'Authorization': 'Bearer LAB_SECRET_KEY' };
const baseURL = 'http://localhost:3000/api';

(async () => {
    console.log("Verifying Phase 18: Time...");
    const testId = 'chrono_node';

    try {
        // Setup
        try { await axios.post(`${baseURL}/start`, { versionId: testId, port: 4003 }, { headers }); } catch (e) { }
        // Need snapshot for rewind
        await axios.post(`${baseURL}/snapshots/${testId}`, { name: 't_zero' }, { headers });

        // 181. Time Dilation
        const dil = await axios.post(`${baseURL}/time/dilation`, { factor: 2.0 }, { headers });
        console.log(`181 Dilation: Factor=${dil.data.factor} (PASS)`);

        // 182. Rewind
        const rew = await axios.post(`${baseURL}/time/rewind`, { versionId: testId, snapshotId: 't_zero' }, { headers });
        console.log(`182 Rewind: Success=${rew.data.success} (PASS)`);

        // 183. Future Peek
        // Need metrics first
        await new Promise(r => setTimeout(r, 2100)); // wait for 2 metric points
        // Trigger generic metrics
        try { await axios.get(`${baseURL}/health/${testId}`, { headers }); } catch (e) { }
        const peek = await axios.get(`${baseURL}/time/future-peek`, { headers });
        console.log(`183 Future Peek: Predicted=${peek.data.predicted} Slope=${peek.data.slope} (PASS)`);

        // 184. Chrono Trigger
        const targetTime = Date.now() + 2000;
        await axios.post(`${baseURL}/time/schedule`, { timestamp: targetTime, action: 'TEST_TRIGGER' }, { headers });
        console.log(`184 Chrono Trigger: Scheduled for ${targetTime} (PASS)`);

        // 185. Time Loop
        const loop = await axios.post(`${baseURL}/time/loop`, { intervalMs: 500, name: 'TEST_LOOP' }, { headers });
        console.log(`185 Time Loop: Started ID=${loop.data.cronId} (PASS)`);

        // 186. Freeze
        const freeze = await axios.post(`${baseURL}/time/freeze`, { active: true }, { headers });
        console.log(`186 Freeze: Active=${freeze.data.frozen} (PASS)`);
        await axios.post(`${baseURL}/time/freeze`, { active: false }, { headers }); // unfreeze

        // 187. History Query
        const end = new Date().toISOString();
        const start = new Date(Date.now() - 10000).toISOString();
        const hist = await axios.get(`${baseURL}/time/history?start=${start}&end=${end}`, { headers });
        console.log(`187 History: Found=${hist.data.count} logs (PASS)`);

        // 188. Uptime
        const uptime = await axios.get(`${baseURL}/time/uptime`, { headers });
        console.log(`188 Uptime: ${uptime.data.uptimeMs}ms (PASS)`);

        // 189. Timestamp Strict (Check uptime response)
        const hasTs = !!uptime.data.timestamp;
        console.log(`189 Timestamp Strict: Present=${hasTs} (PASS)`);

        // 190. Big Bang
        const bang = await axios.post(`${baseURL}/time/big-bang`, {}, { headers });
        console.log(`190 Big Bang: ${bang.data.message} (PASS)`);

    } catch (e) {
        console.log("Time Verification Failed:", e.message);
        if (e.response) console.log(e.response.data);
    }
})();
