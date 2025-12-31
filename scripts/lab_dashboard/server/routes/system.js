const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = (dependencies) => {

    // GET /drives - List available drives (Windows)
    router.get('/drives', async (req, res) => {
        exec('wmic logicaldisk get name', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ error: 'Failed to list drives' });
            }

            const drives = stdout.split('\r\r\n')
                .filter(value => value.trim() && value.trim() !== 'Name')
                .map(value => value.trim());

            res.json(drives);
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

    return router;
};
