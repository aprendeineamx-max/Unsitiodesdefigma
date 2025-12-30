const axios = require('axios');

async function startZIPs() {
    console.log('Starting ZIPs v1-v5...');
    const versions = ['v1', 'v2', 'v3', 'v4', 'v5'];

    for (let i = 0; i < versions.length; i++) {
        const versionId = versions[i];
        const port = 6100 + i;

        try {
            const r = await axios.post('http://localhost:3000/api/start', {
                version: versionId,
                port: port
            });

            console.log(`SUCCESS ${versionId} starting on port ${port}`);
        } catch (e) {
            console.log(`FAILED ${versionId}: ${e.response?.data?.error || e.message}`);
        }

        // Wait 3 seconds between starts
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log('\n Done! Check GUI status.');
}

startZIPs();
