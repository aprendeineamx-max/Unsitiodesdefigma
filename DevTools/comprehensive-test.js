const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function comprehensiveTest() {
    console.log('=== COMPREHENSIVE SYSTEM TEST ===\n');

    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        errors: []
    };

    // Get all versions
    console.log('1. Getting all versions...');
    const versionsResp = await axios.get(`${API_URL}/api/versions`);
    const versions = versionsResp.data;
    console.log(`   Found ${versions.length} versions\n`);

    // Test on first 5 versions
    const testVersions = versions.slice(0, 5);

    for (const version of testVersions) {
        console.log(`\n=== Testing ${version.id} ===`);

        // Test 1: Health Check
        try {
            results.total++;
            const health = await axios.get(`${API_URL}/api/health/${version.id}`);
            console.log(`  ✅ Health: ${health.data.healthy ? 'healthy' : 'unhealthy'}`);
            results.passed++;
        } catch (e) {
            console.log(`  ❌ Health: ${e.message}`);
            results.failed++;
            results.errors.push({ version: version.id, test: 'health', error: e.message });
        }

        // Test 2: Metrics (only if running)
        if (version.status === 'running') {
            try {
                results.total++;
                const metrics = await axios.get(`${API_URL}/api/metrics/${version.id}`);
                console.log(`  ✅ Metrics: CPU ${metrics.data.cpu.current}%, Memory ${metrics.data.memory.current}MB`);
                results.passed++;
            } catch (e) {
                console.log(`  ❌ Metrics: ${e.message}`);
                results.failed++;
                results.errors.push({ version: version.id, test: 'metrics', error: e.message });
            }
        }

        // Test 3: Dependencies Analysis
        try {
            results.total++;
            const deps = await axios.get(`${API_URL}/api/deps/${version.id}/analyze`);
            console.log(`  ✅ Dependencies: ${deps.data.total} total`);
            results.passed++;
        } catch (e) {
            console.log(`  ❌ Dependencies: ${e.message}`);
            results.failed++;
            results.errors.push({ version: version.id, test: 'dependencies', error: e.message });
        }

        // Test 4: Create Snapshot
        try {
            results.total++;
            const snapshot = await axios.post(`${API_URL}/api/snapshots/${version.id}`, {
                name: `test_snapshot_${Date.now()}`
            });
            console.log(`  ✅ Snapshot: ${snapshot.data.snapshot.id}`);
            results.passed++;
        } catch (e) {
            console.log(`  ❌ Snapshot: ${e.message}`);
            results.failed++;
            results.errors.push({ version: version.id, test: 'snapshot', error: e.message });
        }

        // Test 5: Create Backup
        try {
            results.total++;
            const backup = await axios.post(`${API_URL}/api/backup/${version.id}`);
            console.log(`  ✅ Backup: ${backup.data.backup.id}`);
            results.passed++;
        } catch (e) {
            console.log(`  ❌ Backup: ${e.message}`);
            results.failed++;
            results.errors.push({ version: version.id, test: 'backup', error: e.message });
        }

        // Test 6: Get Config
        try {
            results.total++;
            const config = await axios.get(`${API_URL}/api/config/${version.id}`);
            console.log(`  ✅ Config: ${config.data.packageJson ? 'package.json found' : 'no package.json'}`);
            results.passed++;
        } catch (e) {
            console.log(`  ❌ Config: ${e.message}`);
            results.failed++;
            results.errors.push({ version: version.id, test: 'config', error: e.message });
        }

        // Test 7: Terminal Exec (simple dir command)
        try {
            results.total++;
            const exec = await axios.post(`${API_URL}/api/terminal/${version.id}/exec`, {
                command: 'dir'
            });
            console.log(`  ✅ Terminal: Exit code ${exec.data.exitCode}`);
            results.passed++;
        } catch (e) {
            console.log(`  ❌ Terminal: ${e.message}`);
            results.failed++;
            results.errors.push({ version: version.id, test: 'terminal', error: e.message });
        }
    }

    // Summary
    console.log('\n\n=== SUMMARY ===');
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} (${Math.round(results.passed / results.total * 100)}%)`);
    console.log(`Failed: ${results.failed} (${Math.round(results.failed / results.total * 100)}%)`);

    if (results.errors.length > 0) {
        console.log('\n=== ERRORS ===');
        results.errors.forEach(e => {
            console.log(`${e.version} - ${e.test}: ${e.error}`);
        });
    }

    return results;
}

comprehensiveTest().catch(console.error);
