const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = (dependencies) => {

    // GET /drives - List available drives (Windows/Linux)
    router.get('/drives', async (req, res) => {
        // Linux/Mac Support (Docker Container)
        if (process.platform !== 'win32') {
            return res.json(['/']);
        }

        // Windows Support
        exec('powershell -Command "Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Name"', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.json(['C:']); // Default fallback
            }
            const drives = stdout.split(/\r?\n/)
                .map(d => d.trim())
                .filter(d => d && d.length === 1)
                .map(d => d + ':');
            res.json(drives.length ? drives : ['C:']);
        });
    });

    // GET /files - List files in an absolute path
    router.get('/files', async (req, res) => {
        const targetPath = req.query.path;
        if (!targetPath) return res.status(400).json({ error: 'Path is required' });

        try {
            const items = await fs.promises.readdir(targetPath, { withFileTypes: true });
            const fileList = items.map(item => ({
                name: item.name,
                isDirectory: item.isDirectory(),
                path: path.join(targetPath, item.name),
                size: item.isDirectory() ? 0 : 0
            }));

            // Sort directories first
            fileList.sort((a, b) => {
                if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
                return a.isDirectory ? -1 : 1;
            });

            res.json({ path: targetPath, files: fileList });
        } catch (err) {
            console.error('System Access Error:', err);
            res.status(500).json({ error: err.message, path: targetPath });
        }
    });

    // Helper: Execute PowerShell via Script File
    const executePowerShell = async (scriptContent) => {
        const scriptName = `_temp_vss_${Date.now()}_${Math.random().toString(36).substring(7)}.ps1`;
        const scriptPath = path.join(dependencies.LABS_DIR, scriptName);

        try {
            await fs.promises.writeFile(scriptPath, scriptContent);

            return new Promise((resolve, reject) => {
                exec(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, (error, stdout, stderr) => {
                    // Cleanup always
                    fs.unlink(scriptPath, () => { });

                    if (error) return reject(error);
                    if (stderr && !stderr.includes('CLIXML')) {
                        console.warn('PowerShell Stderr:', stderr);
                    }
                    resolve(stdout.trim());
                });
            });
        } catch (err) {
            if (fs.existsSync(scriptPath)) fs.unlink(scriptPath, () => { });
            throw err;
        }
    };

    // POST /snapshot/create - Create a new VSS Snapshot of C:
    router.post('/snapshot/create', async (req, res) => {
        if (process.platform !== 'win32') {
            return res.status(400).json({ error: 'System Snapshots (VSS) are only supported on Windows Servers.' });
        }
        const volume = req.body.volume || 'C:\\';

        const psScript = `
$ErrorActionPreference = "Stop"
try {
    $class = [WMICLASS]"root\\cimv2:Win32_ShadowCopy"
    $result = $class.Create("${volume}", "ClientAccessible")
    if ($result.ReturnValue -eq 0) {
        $shadow = Get-WmiObject Win32_ShadowCopy | Where-Object { $_.ID -eq $result.ShadowID }
        Write-Output "$($shadow.DeviceObject)|$($shadow.ID)|$($shadow.InstallDate)"
    } else {
        throw "Failed to create shadow copy. ReturnValue: $($result.ReturnValue)"
    }
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
`;
        try {
            const output = await executePowerShell(psScript);
            const [deviceObject, id, installDate] = output.split('|');

            res.json({
                success: true,
                snapshot: {
                    id: id.trim(),
                    path: deviceObject.trim(),
                    date: installDate.trim(),
                    volume: volume
                }
            });
        } catch (err) {
            console.error('Snapshot Create Error:', err);
            res.status(500).json({ error: 'Failed to create snapshot', details: err.message });
        }
    });

    // POST /snapshot/delete - Delete a Snapshot by ID
    router.post('/snapshot/delete', async (req, res) => {
        if (process.platform !== 'win32') {
            return res.status(400).json({ error: 'System Snapshots (VSS) are only supported on Windows Servers.' });
        }
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'Snapshot ID is required' });

        const psScript = `
$ErrorActionPreference = "Stop"
try {
    $shadow = Get-WmiObject Win32_ShadowCopy | Where-Object { $_.ID -eq "${id}" }
    if ($shadow) {
        $shadow.Delete()
        Write-Output "Deleted"
    } else {
        throw "Snapshot not found"
    }
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
`;
        try {
            await executePowerShell(psScript);
            res.json({ success: true });
        } catch (err) {
            console.error('Snapshot Delete Error:', err);
            res.status(500).json({ error: 'Failed to delete snapshot', details: err.message });
        }
    });

    // POST /deploy - Trigger Full Production Deployment
    router.post('/deploy', async (req, res) => {
        const deployScript = path.resolve(dependencies.PROJECT_ROOT || path.join(__dirname, '../../../'), 'scripts/deploy/full_deploy.js');

        console.log('🚀 Triggering manual deployment from GUI...');
        const deployProcess = dependencies.spawn('node', [deployScript], {
            cwd: path.dirname(deployScript),
            env: { ...process.env, FORCE_COLOR: '1' }
        });

        res.json({ success: true, message: 'Deployment started' });

        deployProcess.stdout.on('data', (data) => {
            const line = data.toString();
            // dependencies.io is Socket.IO instance attached in server.js
            dependencies.io.emit('deploy-log', line);
        });

        deployProcess.stderr.on('data', (data) => {
            const line = data.toString();
            dependencies.io.emit('deploy-log', `ERR: ${line}`);
        });

        deployProcess.on('close', (code) => {
            dependencies.io.emit('deploy-log', `\n✨ Deployment Process Exited with code ${code}`);
            dependencies.io.emit('deploy-status', { status: code === 0 ? 'success' : 'error' });
        });
    });
    return router;
};
