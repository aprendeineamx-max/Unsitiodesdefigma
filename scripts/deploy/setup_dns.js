const axios = require('axios');
const fs = require('fs');
const path = require('path');

// CONFIG
const API_KEY = process.env.CF_API_KEY || '3bc055261e648805ddf1f41304a304476e5e9'; // Global API Key
// Note: Global API Key usually requires X-Auth-Key and X-Auth-Email.
// Trying Bearer first, if fails will switch to Auth-Key/Email if known.
// User didn't provide email explicitly for Headers, but provided "Global API Key".
// Usually Global Key needs Email. Origin CA Key is for certs.
// Wait, user provided email: dolphin.anty.universal@gmail.com
const EMAIL = 'eduardo.ramirez.gob.mx@gmail.com';
const DOMAIN = 'micuenta.shop';
const ZONE_ID = ''; // Will search if empty

const headers = {
    'X-Auth-Email': EMAIL,
    'X-Auth-Key': API_KEY,
    'Content-Type': 'application/json'
};

async function main() {
    console.log('🚀 Starting Cloudflare DNS Setup...');

    // 1. Get VPS IP
    const vpsInfoPath = path.join(__dirname, 'vps_info.json');
    if (!fs.existsSync(vpsInfoPath)) {
        console.error('❌ vps_info.json not found. Run provision_vultr.js first!');
        process.exit(1);
    }
    const vps = JSON.parse(fs.readFileSync(vpsInfoPath, 'utf8'));
    const ip = vps.main_ip;
    console.log(`TARGET IP: ${ip}`);

    try {
        // 2. Get Zone ID
        console.log('Fetching Zone ID...');
        const resZone = await axios.get(`https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}`, { headers });
        const zone = resZone.data.result[0];
        if (!zone) throw new Error(`Zone ${DOMAIN} not found in Cloudflare account.`);
        const zoneId = zone.id;
        console.log(`✅ Zone ID: ${zoneId}`);

        // 3. Check/Update Records
        // A Record: @
        await updateRecord(zoneId, 'A', DOMAIN, ip, true);
        // CNAME Record: www
        await updateRecord(zoneId, 'CNAME', `www.${DOMAIN}`, DOMAIN, true);

    } catch (err) {
        console.error('❌ Error:', err.response?.data || err.message);
    }
}

async function updateRecord(zoneId, type, name, content, proxied) {
    console.log(`Checking ${type} record for ${name}...`);
    const resList = await axios.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=${type}&name=${name}`, { headers });
    const existing = resList.data.result[0];

    if (existing) {
        if (existing.content === content && existing.proxied === proxied) {
            console.log(`   ✅ Record already up to date.`);
        } else {
            console.log(`   Updating record...`);
            await axios.put(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`, {
                type, name, content, proxied
            }, { headers });
            console.log(`   ✅ Updated!`);
        }
    } else {
        console.log(`   Creating record...`);
        await axios.post(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
            type, name, content, proxied
        }, { headers });
        console.log(`   ✅ Created!`);
    }
}

main();
