
const fs = require('fs');
const path = require('path');

const SERVER_FILE = 'c:\\Users\\Administrator\\Downloads\\Unsitio-Figma-Clean\\scripts\\lab_dashboard\\server\\server.js';
const UNARCHIVE_ENDPOINT = `
// ==========================================
// UNARCHIVE ENDPOINT (Injected)
// ==========================================
app.post('/api/unarchive', async (req, res) => {
    try {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'Missing version' });

        const archivePath = path.join(LABS_DIR, '_Archive', version);
        const targetPath = path.join(LABS_DIR, version);

        if (!fs.existsSync(archivePath)) {
            return res.status(404).json({ error: 'Not found in archive' });
        }

        if (fs.existsSync(targetPath)) {
            return res.status(409).json({ error: 'A ZIP with this name already exists in active labs' });
        }

        // Ensure target parent dir exists (should exist)
        await fs.ensureDir(LABS_DIR);

        // Move from Archive to Labs
        await fs.move(archivePath, targetPath, { overwrite: false });

        broadcastLog('system', \`✅ Unarchived \${version}\`, 'success');
        broadcastState();

        io.emit('action', {
            type: 'ZIP_RESTORED',
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
`;

try {
    let content = fs.readFileSync(SERVER_FILE, 'utf8');

    if (content.includes("/api/unarchive")) {
        console.log("Endpoint already exists!");
        process.exit(0);
    }

    // Insert after /api/archive/list
    // We look for the closing of app.get('/api/archive/list' ...
    // It ends with });
    // And is followed by app.post('/api/trash'

    const anchor = "app.post('/api/trash', async (req, res) => {";

    if (!content.includes(anchor)) {
        console.error("Could not find anchor: app.post('/api/trash' ...");
        process.exit(1);
    }

    const newContent = content.replace(anchor, UNARCHIVE_ENDPOINT + "\n\n" + anchor);
    fs.writeFileSync(SERVER_FILE, newContent);
    console.log("Successfully injected /api/unarchive endpoint.");

} catch (e) {
    console.error("Error:", e);
    process.exit(1);
}
