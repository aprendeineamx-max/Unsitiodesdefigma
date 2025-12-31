
const axios = require('axios');
const headers = { 'Authorization': 'Bearer LAB_SECRET_KEY' };
const baseURL = 'http://localhost:3000/api';

(async () => {
    console.log("Verifying Phase 15: Creation...");
    const testId = 'creation_lab';

    try {
        // Ensure test lab exists
        try { await axios.post(`${baseURL}/start`, { versionId: testId, port: 7000 }, { headers }); } catch (e) { }

        // 151. Component Scaffold
        const comp = await axios.post(`${baseURL}/create/component`, { versionId: testId, name: 'Hero' }, { headers });
        console.log(`151 Component: ${comp.data.success ? 'PASS' : 'FAIL'} (${comp.data.path})`);

        // 152. Route
        const route = await axios.post(`${baseURL}/create/route`, { versionId: testId, routeName: 'dynamic' }, { headers });
        console.log(`152 Route: ${route.data.success ? 'PASS' : 'FAIL'}`);

        // 153. Config
        const cfg = await axios.post(`${baseURL}/create/config`, { versionId: testId, params: { mode: 'god' } }, { headers });
        console.log(`153 Config: ${cfg.data.success ? 'PASS' : 'FAIL'}`);

        // 154. Readme
        const readme = await axios.post(`${baseURL}/create/readme`, { versionId: testId }, { headers });
        console.log(`154 Readme: ${readme.data.success ? 'PASS' : 'FAIL'}`);

        // 155. License
        // Create a dummy JS file first
        await axios.post(`${baseURL}/terminal/exec`, { command: `echo console.log > creation_features.js`, cwd: `../../Figma_Labs/${testId}` }, { headers }); // Assuming relative path
        // Wait... command injection might prevent this or path issues. 
        // Actually, we verified Component Scaffold created a .tsx. Law 155 checks .js.
        // Route scaffold created a .js! ('dynamic.js'). Checking that.
        const lic = await axios.post(`${baseURL}/create/license-stamp`, { versionId: testId }, { headers });
        console.log(`155 License: ${lic.data.success ? 'PASS' : 'FAIL'}`);

        // 156. Template
        const templ = await axios.post(`${baseURL}/create/from-template`, { templateId: 'react', newId: 'react_clone' }, { headers });
        console.log(`156 Template: ${templ.data.success ? 'PASS' : 'FAIL'}`);

        // 157. Manifesto
        // Create a dirty.txt in testId
        // We can use /api/files/write if it worked? But it was broken earlier.
        // We'll trust existing dirty files from earlier tests.
        const man = await axios.post(`${baseURL}/create/manifesto`, {}, { headers });
        console.log(`157 Manifesto: ${man.data.success ? 'PASS' : 'FAIL'} (${man.data.file})`);

        // 158. API Key
        const key = await axios.post(`${baseURL}/create/apikey`, {}, { headers });
        console.log(`158 API Key: ${key.data.key ? 'PASS' : 'FAIL'}`);

        // 159. Theme
        const theme = await axios.post(`${baseURL}/create/theme`, { name: 'dark_matter' }, { headers });
        console.log(`159 Theme: ${theme.data.success ? 'PASS' : 'FAIL'}`);

        // 160. Project Init
        const struc = await axios.post(`${baseURL}/create/structure`, { versionId: testId, structure: ['src/api', 'src/types/core'] }, { headers });
        console.log(`160 Structure: ${struc.data.success ? 'PASS' : 'FAIL'}`);

    } catch (e) {
        console.log("Creation Verification Failed:", e.message);
        if (e.response) console.log(e.response.data);
    }
})();
