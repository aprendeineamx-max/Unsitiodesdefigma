const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3000';
const OUTPUT_FILE = 'comprehensive-test-results.json';

async function exhaustiveTest() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   EXHAUSTIVE API TEST - ALL 25 ZIPS - ALL APIS      ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    const results = {
        timestamp: new Date().toISOString(),
        totalVersions: 0,
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        versions: {},
        summary: {},
        errors: []
    };

    try {
        // Get all versions
        console.log('📋 Step 1: Getting all versions...');
        const versionsResp = await axios.get(`${API_URL}/api/versions`);
        const versions = versionsResp.data;
        results.totalVersions = versions.length;
        console.log(`   Found ${versions.length} versions\n`);

        // Test EVERY version
        for (const version of versions) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🔍 Testing ${version.id} (status: ${version.status})`);
            console.log('='.repeat(60));

            results.versions[version.id] = {
                status: version.status,
                port: version.port,
                tests: {},
                passed: 0,
                failed: 0
            };

            // Test 1: Health Check
            await runTest(results, version.id, 'health', async () => {
                const r = await axios.get(`${API_URL}/api/health/${version.id}`);
                return {
                    healthy: r.data.healthy,
                    checks: r.data.checks
                };
            });

            // Test 2: Metrics (only if running)
            if (version.status === 'running') {
                await runTest(results, version.id, 'metrics', async () => {
                    const r = await axios.get(`${API_URL}/api/metrics/${version.id}`);
                    return {
                        cpu: r.data.cpu.current,
                        memory: r.data.memory.current,
                        uptime: r.data.uptime.formatted
                    };
                });
            }

            // Test 3: Dependencies Analysis
            await runTest(results, version.id, 'dependencies', async () => {
                const r = await axios.get(`${API_URL}/api/deps/${version.id}/analyze`);
                return {
                    total: r.data.total,
                    dependencies: r.data.dependencies,
                    devDependencies: r.data.devDependencies
                };
            });

            // Test 4: Get Config
            await runTest(results, version.id, 'config', async () => {
                const r = await axios.get(`${API_URL}/api/config/${version.id}`);
                return {
                    hasViteConfig: !!r.data.viteConfig,
                    hasPackageJson: !!r.data.packageJson
                };
            });

            // Test 5: Get Env Variables
            await runTest(results, version.id, 'env-get', async () => {
                const r = await axios.get(`${API_URL}/api/env/${version.id}`);
                return {
                    varsCount: Object.keys(r.data).length
                };
            });

            // Test 6: Create Snapshot
            await runTest(results, version.id, 'snapshot-create', async () => {
                const r = await axios.post(`${API_URL}/api/snapshots/${version.id}`, {
                    name: `test_${Date.now()}`
                });
                return {
                    snapshotId: r.data.snapshot.id,
                    size: r.data.snapshot.size
                };
            });

            // Test 7: List Snapshots
            await runTest(results, version.id, 'snapshot-list', async () => {
                const r = await axios.get(`${API_URL}/api/snapshots/${version.id}`);
                return {
                    count: r.data.snapshots.length
                };
            });

            // Test 8: Create Backup
            await runTest(results, version.id, 'backup-create', async () => {
                const r = await axios.post(`${API_URL}/api/backup/${version.id}`);
                return {
                    backupId: r.data.backup.id
                };
            });

            // Test 9: List Backups
            await runTest(results, version.id, 'backup-list', async () => {
                const r = await axios.get(`${API_URL}/api/backup/${version.id}/list`);
                return {
                    count: r.data.backups.length
                };
            });

            // Test 10: Terminal Exec
            await runTest(results, version.id, 'terminal-exec', async () => {
                const r = await axios.post(`${API_URL}/api/terminal/${version.id}/exec`, {
                    command: 'echo test'
                });
                return {
                    exitCode: r.data.exitCode,
                    success: r.data.success
                };
            });

            // Test 11: Get Files
            await runTest(results, version.id, 'files-list', async () => {
                const r = await axios.get(`${API_URL}/api/files?versionId=${version.id}`);
                return {
                    itemsCount: r.data.items?.length || 0
                };
            });

            console.log(`\n📊 ${version.id} Summary: ${results.versions[version.id].passed}/${results.versions[version.id].passed + results.versions[version.id].failed} passed`);
        }

        // Calculate summary
        results.summary = calculateSummary(results);

        // Save to file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: ${OUTPUT_FILE}\n`);

        // Print summary
        printSummary(results);

    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        results.errors.push({
            type: 'fatal',
            message: error.message,
            stack: error.stack
        });
    }

    return results;
}

async function runTest(results, versionId, testName, testFn) {
    results.totalTests++;

    try {
        const result = await testFn();
        results.totalPassed++;
        results.versions[versionId].passed++;
        results.versions[versionId].tests[testName] = {
            status: 'pass',
            result
        };
        console.log(`  ✅ ${testName}: ${JSON.stringify(result)}`);
    } catch (error) {
        results.totalFailed++;
        results.versions[versionId].failed++;
        results.versions[versionId].tests[testName] = {
            status: 'fail',
            error: error.message
        };
        results.errors.push({
            version: versionId,
            test: testName,
            error: error.message
        });
        console.log(`  ❌ ${testName}: ${error.message}`);
    }
}

function calculateSummary(results) {
    const summary = {
        totalTests: results.totalTests,
        totalPassed: results.totalPassed,
        totalFailed: results.totalFailed,
        passRate: ((results.totalPassed / results.totalTests) * 100).toFixed(2) + '%',
        byTest: {},
        byVersion: {}
    };

    // Summary by test type
    const testTypes = new Set();
    Object.values(results.versions).forEach(v => {
        Object.keys(v.tests).forEach(t => testTypes.add(t));
    });

    testTypes.forEach(testType => {
        let passed = 0;
        let failed = 0;
        Object.values(results.versions).forEach(v => {
            if (v.tests[testType]) {
                if (v.tests[testType].status === 'pass') passed++;
                else failed++;
            }
        });
        summary.byTest[testType] = {
            passed,
            failed,
            total: passed + failed,
            passRate: ((passed / (passed + failed)) * 100).toFixed(2) + '%'
        };
    });

    return summary;
}

function printSummary(results) {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║                    FINAL SUMMARY                      ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log(`📊 Total Versions Tested: ${results.totalVersions}`);
    console.log(`🧪 Total Tests Executed: ${results.totalTests}`);
    console.log(`✅ Tests Passed: ${results.totalPassed} (${results.summary.passRate})`);
    console.log(`❌ Tests Failed: ${results.totalFailed}\n`);

    console.log('📈 Results by Test Type:');
    Object.entries(results.summary.byTest).forEach(([test, stats]) => {
        console.log(`  ${test.padEnd(20)}: ${stats.passed}/${stats.total} (${stats.passRate})`);
    });

    if (results.errors.length > 0) {
        console.log(`\n⚠️  Total Errors: ${results.errors.length}`);
    }
}

// Execute
exhaustiveTest()
    .then(results => {
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
