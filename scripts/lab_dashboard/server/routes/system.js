const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = (dependencies) => {

    // GET /drives - List available drives (Windows)
    router.get('/drives', async (req, res) => {
        // Use PowerShell as wmic is deprecated
        exec('powershell -Command "Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Name"', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                // Fallback or empty
                return res.json(['C:']); // Assume C: at least
            }

            const drives = stdout.split(/\r?\n/)
                .map(d => d.trim())
                .filter(d => d && d.length === 1) // Expect single letters
                .map(d => d + ':');

            res.json(drives.length ? drives : ['C:']);
        });
    });

    // GET /files - List files in an absolute path
    // Query: ?path=C:\Users\Administrator
    router.get('/files', async (req, res) => {
        const targetPath = req.query.path;

        if (!targetPath) {
            return res.status(400).json({ error: 'Path is required' });
        }

        // Security Check: For now, we allow reading, but effectively this is "Root" access.
        // In a real multi-user env, this is dangerous. For this single-user tool, it's requested.

        try {
            const items = await fs.promises.readdir(targetPath, { withFileTypes: true });

            const fileList = items.map(item => ({
                name: item.name,
                isDirectory: item.isDirectory(),
                path: path.join(targetPath, item.name),
                size: item.isDirectory() ? 0 : 0 // Size calculation can be slow for folders
            }));

            // Sort directories first
            fileList.sort((a, b) => {
                if (a.isDirectory === b.isDirectory) {
                    return a.name.localeCompare(b.name);
                }
                return a.isDirectory ? -1 : 1;
            });

            res.json({
                path: targetPath,
                files: fileList
            });

        } catch (err) {
            console.error('System Access Error:', err);
            res.status(500).json({ error: err.message, path: targetPath });
        }
    });


    // POST /snapshot/create - Create a new VSS Snapshot of C:
    router.post('/snapshot/create', async (req, res) => {
        const volume = req.body.volume || 'C:\\'; // Default to C:

        const psCommand = `
            $class = [WMICLASS]"root\\cimv2:Win32_ShadowCopy"
            $result = $class.Create("${volume}", "ClientAccessible")
            if ($result.ReturnValue -eq 0) {
                $shadow = Get-WmiObject Win32_ShadowCopy | Where-Object { $_.ID -eq $result.ShadowID }
                Write-Output ($shadow.DeviceObject + "|" + $shadow.ID + "|" + $shadow.InstallDate)
            } else {
                Write-Error "Failed to create shadow copy. ReturnValue: $($result.ReturnValue)"
            }
        `;

        exec(`powershell -Command "${psCommand.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
            if (error || stderr) {
                console.error(`Snapshot Error: ${stderr || error}`);
                return res.status(500).json({ error: 'Failed to create snapshot. Ensure Admin privileges.' });
            }

            const output = stdout.trim();
            if (!output) {
                return res.status(500).json({ error: 'No output from snapshot creation.' });
            }

            const [deviceObject, id, installDate] = output.split('|');
            res.json({
                success: true,
                snapshot: {
                    id: id.trim(),
                    path: deviceObject.trim(), // e.g., \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopyX
                    date: installDate.trim(),
                    volume: volume
                }
            });
        });
    });

    // POST /snapshot/delete - Delete a Snapshot by ID
    router.post('/snapshot/delete', async (req, res) => {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'Snapshot ID is required' });

        // Safety: Only delete explicitly requested ID
        const psCommand = `
            $shadow = Get-WmiObject Win32_ShadowCopy | Where-Object { $_.ID -eq "${id}" }
            if ($shadow) {
                $shadow.Delete()
                Write-Output "Deleted"
            } else {
                Write-Error "Snapshot not found"
            }
        `;

        exec(`powershell -Command "${psCommand.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
            if (error && !stderr.includes('Deleted')) {
                return res.status(500).json({ error: 'Failed to delete snapshot' });
            }
            res.json({ success: true });
        });
    });

    return router;
};
