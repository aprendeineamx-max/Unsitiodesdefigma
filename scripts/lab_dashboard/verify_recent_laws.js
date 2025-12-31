
const axios = require('axios');
const headers = { 'Authorization': 'Bearer LAB_SECRET_KEY' };
const baseURL = 'http://localhost:3000/api';

(async () => {
    console.log("=== REGRESSION TEST: LAWS 161-200 ===");
    const testId = 'regression_node';
    let failures = 0;

    try {
        // Setup
        try { await axios.post(`${baseURL}/start`, { versionId: testId, port: 4010 }, { headers }); } catch (e) { }

        // PHASE 16: EVOLUTION
        console.log("\n[EVOLUTION] Testing...");
        // 161 Hot Patch
        await axios.post(`${baseURL}/evolution/hot-patch`, { code: "res.json({ msg: 'Patched' })" }, { headers });
        const patch = await axios.get(`${baseURL}/evolution/hot-logic`, { headers });
        if (patch.data.msg !== 'Patched') { console.log("FAIL: Hot Patch"); failures++; }
        else console.log("PASS: Hot Patch");

        // PHASE 17: COMMUNICATION
        console.log("\n[COMMUNICATION] Testing...");
        // 173 Whisper
        const whisper = await axios.post(`${baseURL}/comms/whisper`, { message: 'Secret', secret: 'key' }, { headers });
        if (!whisper.data.content) { console.log("FAIL: Whisper"); failures++; }
        else console.log("PASS: Whisper");

        // PHASE 18: TIME
        console.log("\n[TIME] Testing...");
        // 181 Dilation
        const dil = await axios.post(`${baseURL}/time/dilation`, { factor: 1.5 }, { headers });
        if (dil.data.factor !== 1.5) { console.log("FAIL: Dilation"); failures++; }
        else console.log("PASS: Dilation");

        // PHASE 19: DIMENSION
        console.log("\n[DIMENSION] Testing...");
        // 191 Ramdisk
        await axios.post(`${baseURL}/dimension/ramdisk/write`, { path: 'regress.txt', content: 'check' }, { headers });
        const read = await axios.get(`${baseURL}/dimension/ramdisk/read?path=regress.txt`, { headers });
        if (read.data.content !== 'check') { console.log("FAIL: Ramdisk"); failures++; }
        else console.log("PASS: Ramdisk");

        // 198 Hologram
        await axios.post(`${baseURL}/dimension/hologram`, { route: '/api/regression/holo' }, { headers });
        const holo = await axios.get(`${baseURL}/api/regression/holo`, { headers });
        if (!holo.data.hologram) { console.log("FAIL: Hologram"); failures++; }
        else console.log("PASS: Hologram");

    } catch (e) {
        console.log("CRITICAL FAILURE:", e.message);
        if (e.response) {
            console.log("Status:", e.response.status);
            console.log("Data:", JSON.stringify(e.response.data, null, 2));
        }
        failures++;
    }

    if (failures === 0) {
        console.log("\n=== ALL SYSTEMS NOMINAL (161-200) ===");
    } else {
        console.log(`\n=== ERRORS DETECTED: ${failures} ===`);
        process.exit(1);
    }
})();
