#!/usr/bin/env node

/**
 * Lab Manager API Test Suite
 * 
 * Automated testing of all Lab Manager API endpoints
 */

const axios = require('axios');
const chalk = require('chalk');

const API_URL = 'http://localhost:3000';
let passedTests = 0;
let failedTests = 0;

async function test(name, testFn) {
    try {
        process.stdout.write(`${chalk.cyan('⏳')} ${name}... `);
        await testFn();
        console.log(chalk.green('✅ PASS'));
        passedTests++;
    } catch (err) {
        console.log(chalk.red('❌ FAIL'));
        console.log(chalk.red(`   Error: ${err.message}`));
        failedTests++;
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log(chalk.cyan.bold('\n🧪 Lab Manager API Test Suite\n'));
    console.log(chalk.gray(`Testing API at ${API_URL}\n`));

    // Test 1: API Documentation
    await test('GET /api/docs - API Documentation', async () => {
        const { data, status } = await axios.get(`${API_URL}/api/docs`);
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);
        if (!data.version) throw new Error('Missing version in docs');
        if (!data.endpoints) throw new Error('Missing endpoints in docs');
        if (Object.keys(data.endpoints).length === 0) throw new Error('No endpoints documented');
    });

    // Test 2: System Info
    await test('GET /api/system/info - System Information', async () => {
        const { data, status } = await axios.get(`${API_URL}/api/system/info`);
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);
        if (!data.system) throw new Error('Missing system info');
        if (!data.zips) throw new Error('Missing zips info');
        if (typeof data.zips.total !== 'number') throw new Error('Invalid zips.total');
    });

    // Test 3: Get Versions
    await test('GET /api/versions - List All ZIPs', async () => {
        const { data, status } = await axios.get(`${API_URL}/api/versions`);
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);
        if (!Array.isArray(data)) throw new Error('Expected array response');
        if (data.length === 0) throw new Error('No ZIPs found');
        const firstZip = data[0];
        if (!firstZip.id || !firstZip.status) throw new Error('Invalid ZIP structure');
    });

    // Test 4: Start a ZIP
    await test('POST /api/start - Start ZIP v22', async () => {
        const { data, status } = await axios.post(`${API_URL}/api/start`, {
            version: 'v22',
            port: 5250
        });
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);
        if (!data.success) throw new Error('Start failed');
    });

    // Test 5: Wait for server to start
    await test('Wait 3s for server startup', async () => {
        await sleep(3000);
    });

    // Test 6: Verify v22 is running
    await test('Verify v22 status changed to starting/running', async () => {
        const { data } = await axios.get(`${API_URL}/api/versions`);
        const v22 = data.find(v => v.id === 'v22');
        if (!v22) throw new Error('v22 not found');
        if (!['starting', 'running'].includes(v22.status)) {
            throw new Error(`Expected starting/running, got ${v22.status}`);
        }
    });

    // Test 7: Stop v22
    await test('POST /api/stop - Stop ZIP v22', async () => {
        const { data, status } = await axios.post(`${API_URL}/api/stop`, {
            version: 'v22'
        });
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);
        if (!data.success) throw new Error('Stop failed');
    });

    // Test 8: Verify v22 stopped
    await test('Wait 2s and verify v22 stopped', async () => {
        await sleep(2000);
        const { data } = await axios.get(`${API_URL}/api/versions`);
        const v22 = data.find(v => v.id === 'v22');
        if (!v22) throw new Error('v22 not found');
        if (v22.status !== 'stopped') {
            console.log(chalk.yellow(`   Warning: Status is ${v22.status}, not stopped`));
        }
    });

    // Test 9: File System - Browse files
    await test('GET /api/files - Browse v22 files', async () => {
        const { data, status } = await axios.get(`${API_URL}/api/files`, {
            params: { versionId: 'v22' }
        });
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);
        if (!data.items) throw new Error('Missing items in response');
        if (!Array.isArray(data.items)) throw new Error('Items should be array');
    });

    // Test 10: File System - Read package.json
    await test('GET /api/files/read - Read package.json', async () => {
        const { data, status } = await axios.get(`${API_URL}/api/files/read`, {
            params: {
                versionId: 'v22',
                path: 'package.json'
            }
        });
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);
        if (!data.content) throw new Error('Missing content in response');
        const pkg = JSON.parse(data.content);
        if (!pkg.name) throw new Error('Invalid package.json');
    });

    // Test 11: Git Status
    await test('GET /api/git/status - Check Git status', async () => {
        const { data, status } = await axios.get(`${API_URL}/api/git/status`, {
            params: { versionId: 'v22' }
        });
        if (status !== 200) throw new Error(`Expected 200, got ${status}`);
        // Git status can be { isRepo: false } which is valid
    });

    // Results
    console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.cyan.bold('📊 Test Results\n'));
    console.log(chalk.green(`✅ Passed: ${passedTests}`));
    console.log(chalk.red(`❌ Failed: ${failedTests}`));
    console.log(chalk.cyan(`📝 Total:  ${passedTests + failedTests}`));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    if (failedTests === 0) {
        console.log(chalk.green.bold('🎉 All tests passed!\n'));
        process.exit(0);
    } else {
        console.log(chalk.red.bold('❌ Some tests failed\n'));
        process.exit(1);
    }
}

// Run tests
runTests().catch(err => {
    console.error(chalk.red('\n💥 Test suite crashed:'), err.message);
    process.exit(1);
});
