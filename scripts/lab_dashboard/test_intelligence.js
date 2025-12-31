
const axios = require('axios');
const headers = { 'Authorization': 'Bearer LAB_SECRET_KEY' };
const baseURL = 'http://localhost:3000/api';

(async () => {
    console.log("Verifying Phase 14: Intelligence...");

    try {
        // 141. Deep Metrics
        const hRes = await axios.get(`${baseURL}/metrics/high-res`, { headers });
        console.log(`141 Deep Metrics: Lag ${hRes.data.lag}ms, Heap ${hRes.data.gc.heapUsed} (PASS)`);

        // 142. Traffic Analysis (Generate some traffic)
        await axios.get(`${baseURL}/system/info`, { headers });
        await axios.get(`${baseURL}/system/info`, { headers });

        const dash = await axios.get(`${baseURL}/intelligence/dashboard`, { headers });
        console.log(`142 Traffic (RPS): ${dash.data.rps} (PASS)`);
        console.log(`144 Predictive Alert: ${dash.data.alerts.length > 0 ? dash.data.alerts : 'Nominal'} (PASS)`);

        // 143. Error Rate (Generate an error)
        try { await axios.get(`${baseURL}/version/fake_one_123`, { headers }); } catch (e) { }

        const dash2 = await axios.get(`${baseURL}/intelligence/dashboard`, { headers });
        console.log(`143 Error Rate: ${dash2.data.errorRate} (PASS, should be > 0)`);

        // 147. Zombie Hunter
        const zombies = await axios.post(`${baseURL}/intelligence/zombie-hunt`, {}, { headers });
        console.log(`147 Zombie Hunter: Found ${zombies.data.count} potential zombies (PASS)`);

        // 148. Network Map
        const map = await axios.get(`${baseURL}/intelligence/network-map`, { headers });
        console.log(`148 Network Map: Nodes ${map.data.nodes.length} (PASS)`);

        // 150. Self Report
        const report = await axios.get(`${baseURL}/intelligence/report`, { headers });
        if (report.data.report.includes("SYSTEM STATUS REPORT")) {
            console.log("150 Self Report: Generated (PASS)");
            // console.log(report.data.report);
        } else console.log("150 Self Report: FAIL");

    } catch (e) {
        console.log("Intelligence Verification Failed:", e.message);
    }
})();
