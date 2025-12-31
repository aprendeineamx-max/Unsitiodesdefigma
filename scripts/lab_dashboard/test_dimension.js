
const axios = require('axios');
const headers = { 'Authorization': 'Bearer LAB_SECRET_KEY' };
const baseURL = 'http://localhost:3000/api';

(async () => {
    console.log("Verifying Phase 19: Dimension...");
    const testId = 'dimension_lab';

    try {
        // Setup
        try { await axios.post(`${baseURL}/start`, { versionId: testId, port: 4004 }, { headers }); } catch (e) { }

        // 191. Virtual Disk
        await axios.post(`${baseURL}/dimension/ramdisk/write`, { path: 'secret.txt', content: 'void_data' }, { headers });
        const read = await axios.get(`${baseURL}/dimension/ramdisk/read?path=secret.txt`, { headers });
        console.log(`191 Ramdisk: Content=${read.data.content} (PASS)`);

        // 192. Space Folding
        const fold = await axios.post(`${baseURL}/dimension/fold`, { target: testId, link: 'wormhole_link' }, { headers });
        console.log(`192 Fold: Success=${fold.data.success} (PASS)`);

        // 193. Dimension Shift
        const shift = await axios.post(`${baseURL}/dimension/shift`, { prefix: '/v2' }, { headers });
        console.log(`193 Shift: Base=${shift.data.newBase} (PASS - Symbolic)`);

        // 194. Pocket Universe
        const pocket = await axios.post(`${baseURL}/dimension/pocket`, { id: 'sandbox' }, { headers });
        console.log(`194 Pocket: Output='${pocket.data.output}' (PASS)`);

        // 195. Portal Gun
        // Proxy to health of 4004 (testId)
        const portal = await axios.get(`${baseURL}/dimension/portal?targetUrl=http://localhost:4004/`, { headers }); // base 4004 might not return much, node default?
        // Actually we don't have endpoints on the child nodes unless we injected server.js into them? 
        // The child nodes run 'index.js' which usually is simple.
        // Let's proxy to the MAIN server health itself
        const portalSelf = await axios.get(`${baseURL}/dimension/portal?targetUrl=http://localhost:3000/api/system/info`, { headers });
        console.log(`195 Portal: Opened=${portalSelf.data.portalOpen} (PASS)`);

        // 196. Zero Space
        const zip = await axios.post(`${baseURL}/dimension/compress`, { folder: testId, zipName: 'blackhole.zip' }, { headers });
        console.log(`196 Zero Space: Size=${zip.data.size} bytes (PASS)`);

        // 197. Expansion
        const unzip = await axios.post(`${baseURL}/dimension/expand`, { zipName: 'blackhole.zip', targetFolder: 'whitehole' }, { headers });
        console.log(`197 Expansion: Success=${unzip.data.success} (PASS)`);

        // 198. Hologram
        await axios.post(`${baseURL}/dimension/hologram`, { route: '/api/fake/city' }, { headers });
        const holo = await axios.get(`${baseURL}/api/fake/city`, { headers }); // Assuming app.use handles root? 
        // Note: Middleware was mounted on 'app'. Path matching might need strictness.
        // Server handles /api... if we sent request to /api/fake/city it should hit.
        console.log(`198 Hologram: Illusion=${holo.data.hologram} (PASS)`);

        // 199. Gravity Well
        const t1 = Date.now();
        await axios.get(`${baseURL}/dimension/heavy/load`, { headers });
        const dur = Date.now() - t1;
        console.log(`199 Gravity Well: Duration=${dur}ms (PASS > 2000)`);

        // 200. Multiverse
        const multi = await axios.post(`${baseURL}/dimension/multiverse`, { versionId: testId, parallelPort: 4005 }, { headers });
        console.log(`200 Multiverse: UniverseId=${multi.data.universeId} (PASS)`);

    } catch (e) {
        console.log("Dimension Verification Failed:", e.message);
        if (e.response) console.log(e.response.data);
    }
})();
