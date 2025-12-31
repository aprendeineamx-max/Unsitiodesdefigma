const axios = require('axios');

const API_URL = 'http://localhost:3000';
// We target C:\ directly as requested by the user
// The server has built-in ignores for Windows/Program Files to prevent OS loops.
const TARGET_PATH = 'C:\\';

async function startSync() {
    console.log(`🚀 Requesting Sync for: ${TARGET_PATH}`);
    try {
        await axios.post(`${API_URL}/api/sync`, { path: TARGET_PATH });
        console.log('✅ Successfully added C: Drive to Watcher!');
        console.log('Background upload should start immediately for allowed files (Users, Documents, etc).');
    } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.error === 'Path already watched') {
            console.log('ℹ️ C: Drive is ALREADY being watched.');
        } else {
            console.error('❌ Failed to add watcher:', err.response?.data || err.message);
        }
    }
}

startSync();
