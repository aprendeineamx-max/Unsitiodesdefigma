const express = require('express');
const router = express.Router();

module.exports = (dependencies) => {
    const { LABS_DIR, stopProcess, broadcastLog, broadcastState, io, activeProcesses, fs, path } = dependencies;

    // UPLOAD HANDLER
    const upload = dependencies.multer({ dest: 'uploads/' });

    router.post('/', upload.single('file'), async (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No file' });

        const zipPath = req.file.path;
        const versionId = path.parse(req.file.originalname).name;
        const targetDir = path.join(LABS_DIR, versionId);

        try {
            broadcastLog('system', `Unzipping ${versionId}...`, 'info');
            const zip = new dependencies.AdmZip(zipPath);
            zip.extractAllTo(targetDir, true);
            fs.unlinkSync(zipPath); // Cleanup

            broadcastLog('system', `Extracted ${versionId}`, 'success');
            broadcastState();

            // Auto-install logic could trigger here or be manual via start
            res.json({ success: true, versionId });
        } catch (err) {
            broadcastLog('system', `Upload failed: ${err.message}`, 'error');
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
