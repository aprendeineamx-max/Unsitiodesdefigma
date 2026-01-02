const axios = require('axios');
const fs = require('fs');
const path = require('path');

// CONFIG
const API_KEY = process.env.VULTR_API_KEY || 'TO5MI6UX2KIIMWIBIWBSS5XKFXO5YFDJGOAQ';
const REGION = 'ewr'; // New Jersey (Default)
const PLAN = 'vc2-1c-2gb'; // Standard Cloud Compute ~ $10/mo
const OS_ID = 1743; // Ubuntu 22.04 LTS x64
const LABEL = 'Unsitio-Prod-MegaMission';
const HOSTNAME = 'micuenta.shop';

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

async function main() {
    console.log('🚀 Starting Vultr Provisioning...');

    try {
        // 1. Check existing instances
        console.log('Checking existing instances...');
        const resList = await axios.get('https://api.vultr.com/v2/instances', { headers });
        const existing = resList.data.instances.find(i => i.label === LABEL);

        if (existing) {
            console.log(`✅ Instance "${LABEL}" already exists!`);
            console.log(`   IP: ${existing.main_ip}`);
            console.log(`   Status: ${existing.status}`);
            console.log(`   ID: ${existing.id}`);
            fs.writeFileSync(path.join(__dirname, 'vps_info.json'), JSON.stringify(existing, null, 2));
            return existing;
        }

        // 2. Create Key (Optional but recommended, using password for now as per "Mega Mission" speed)
        // If we want SSH key, we need to create it first. Skipping for now, will rely on initial root password details.

        // 3. Create Instance
        console.log('Creating new instance...');
        const payload = {
            region: REGION,
            plan: PLAN,
            os_id: OS_ID,
            label: LABEL,
            hostname: HOSTNAME,
            backups: "disabled"
        };

        const resCreate = await axios.post('https://api.vultr.com/v2/instances', payload, { headers });
        const instance = resCreate.data.instance;
        console.log(`🎉 Instance created! ID: ${instance.id}`);
        console.log(`   Waiting for IP assignment (Provisioning)...`);

        // 4. Poll for IP
        let retries = 0;
        while (retries < 20) {
            await new Promise(r => setTimeout(r, 10000)); // Wait 10s
            process.stdout.write('.');
            const resPoll = await axios.get(`https://api.vultr.com/v2/instances/${instance.id}`, { headers });
            const current = resPoll.data.instance;

            if (current.main_ip && current.main_ip !== '0.0.0.0' && current.status === 'active') {
                console.log('\n✅ VPS Ready!');
                console.log(`   IP: ${current.main_ip}`);
                console.log(`   Password: ${current.default_password}`);
                fs.writeFileSync(path.join(__dirname, 'vps_info.json'), JSON.stringify(current, null, 2));
                return current;
            }
            retries++;
        }
        console.log('\n⚠️ VPS created but timed out waiting for active status. Check Vultr Dashboard.');

    } catch (err) {
        console.error('❌ Error:', err.response?.data || err.message);
    }
}

main();
