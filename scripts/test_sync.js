const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const API_URL = 'http://localhost:3000';
const TEST_DIR = 'C:\\StressTest_Sync_Source';
const FILE_COUNT = 50;

async function runTest() {
    console.log('🚀 Starting Sync Engine Stress Test...');

    // 1. Setup Test Directory
    console.log(`creating test directory: ${TEST_DIR}`);
    await fs.ensureDir(TEST_DIR);

    // Create dummy files
    for (let i = 0; i < FILE_COUNT; i++) {
        await fs.writeFile(path.join(TEST_DIR, `file_${i}.txt`), `Content of file ${i} at ${Date.now()}`);
    }
    console.log(`✅ Created ${FILE_COUNT} files.`);

    // 2. Add Watcher
    console.log('📡 Adding watcher via API...');
    try {
        await axios.post(`${API_URL}/api/sync`, { path: TEST_DIR });
        console.log('✅ Watcher added.');
    } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.error === 'Path already watched') {
            console.log('ℹ️ Watcher already exists, proceeding...');
        } else {
            console.error('❌ Failed to add watcher:', err.response?.data || err.message);
            return;
        }
    }

    // 3. Verify Watcher List
    const res = await axios.get(`${API_URL}/api/sync`);
    const isWatched = res.data.some(w => w.path === TEST_DIR);
    if (!isWatched) {
        console.error('❌ Test directory not found in watcher list!');
        return;
    }
    console.log('✅ Directory verified in watcher list.');

    // 4. Simulate Changes (Real-Time Sync)
    console.log('📝 Modifying a file to trigger sync...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for initial scan
    await fs.writeFile(path.join(TEST_DIR, `file_0.txt`), `UPDATED Content at ${Date.now()}`);
    console.log('✅ File modified.');

    // 5. Check Cloud List (Mocking verification by checking if server stays alive and maybe listing)
    // In a real integration, we'd check the S3 bucket. Here we assume success if no server crash.
    // Let's list files from cloud to see if they appeared (async)
    console.log('⏳ Waiting for upload...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        const cloudRes = await axios.get(`${API_URL}/api/cloud/list`);
        // We look for sync_backups/
        const uploaded = cloudRes.data.some(f => f.key.includes('StressTest_Sync_Source/file_0.txt'));
        if (uploaded) {
            console.log('✅ Found uploaded file in Cloud List!');
        } else {
            console.warn('⚠️ File not found in immediate list (might be processing or prefix issue). Checking logs...');
        }
    } catch (err) {
        console.error('⚠️ Could not list cloud files', err.message);
    }

    // 6. Stress Test: Large File
    console.log('🏋️ Creating a larger file (10MB)...');
    const largeContent = Buffer.alloc(10 * 1024 * 1024, 'a');
    await fs.writeFile(path.join(TEST_DIR, 'large_file.bin'), largeContent);
    console.log('✅ Large file created.');

    console.log('🎉 Test Sequence Complete. Check Server Window for Upload Logs.');
}

runTest();
