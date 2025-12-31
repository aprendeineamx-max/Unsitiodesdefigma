const express = require('express');
const router = express.Router();
const watcher = require('../core/watcher');

// GET / - List watched paths
router.get('/', (req, res) => {
    res.json(watcher.getPaths());
});

// POST / - Add path to watch
router.post('/', (req, res) => {
    const { path } = req.body;
    if (!path) {
        return res.status(400).json({ error: 'Path is required' });
    }

    try {
        const success = watcher.addPath(path);
        if (success) {
            res.json({ success: true, paths: watcher.getPaths() });
        } else {
            res.status(409).json({ error: 'Path already watched' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE / - Remove path
router.delete('/', (req, res) => {
    const { path } = req.body;
    if (!path) {
        return res.status(400).json({ error: 'Path is required' });
    }

    try {
        watcher.removePath(path);
        res.json({ success: true, paths: watcher.getPaths() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
