const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');

module.exports = (LABS_DIR, stopProcess, broadcastLog, broadcastState, io) => {

    // Archive a ZIP
    router.post('/', async (req, res) => {
        try {
            const { version } = req.body;
            if (!version) return res.status(400).json({ error: 'Missing version' });

            const sourcePath = path.join(LABS_DIR, version);
            const archiveDir = path.join(LABS_DIR, '_Archive');
            const targetPath = path.join(archiveDir, version);

            if (!fs.existsSync(sourcePath)) {
                return res.status(404).json({ error: 'Version not found' });
            }

            // Stop process if running
            stopProcess(version);

            // Create Archive directory if needed
            await fs.ensureDir(archiveDir);

            // Move to Archive
            await fs.move(sourcePath, targetPath, { overwrite: true });

            broadcastLog('system', `📁 Archived ${version}`, 'success');
            broadcastState();

            io.emit('action', {
                type: 'ZIP_ARCHIVED',
                versionId: version,
                timestamp: new Date().toISOString(),
                data: { destination: '_Archive' }
            });

            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    });

    // List archived ZIPs
    router.get('/list', async (req, res) => {
        try {
            const archiveDir = path.join(LABS_DIR, '_Archive');

            if (!fs.existsSync(archiveDir)) {
                return res.json([]);
            }

            const items = await fs.readdir(archiveDir);
            const dirs = [];

            for (const item of items) {
                const itemPath = path.join(archiveDir, item);
                const stat = await fs.stat(itemPath);
                if (stat.isDirectory()) {
                    dirs.push({ id: item });
                }
            }

            res.json(dirs);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    });

    // Restore from archive
    router.post('/restore', async (req, res) => {
        try {
            const { version } = req.body;
            if (!version) return res.status(400).json({ error: 'Missing version' });

            const archivePath = path.join(LABS_DIR, '_Archive', version);
            const targetPath = path.join(LABS_DIR, version);

            if (!fs.existsSync(archivePath)) {
                return res.status(404).json({ error: 'Not found in archive' });
            }

            if (fs.existsSync(targetPath)) {
                return res.status(409).json({ error: 'A ZIP with this name already exists' });
            }

            await fs.move(archivePath, targetPath, { overwrite: false });

            broadcastLog('system', `✅ Restored ${version} from Archive`, 'success');
            broadcastState();

            io.emit('action', {
                type: 'ZIP_RESTORED_FROM_ARCHIVE',
                versionId: version,
                timestamp: new Date().toISOString(),
                data: { from: '_Archive' }
            });

            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
