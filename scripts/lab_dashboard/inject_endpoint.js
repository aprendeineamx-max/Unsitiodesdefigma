
const fs = require('fs');

const SERVER_FILE = 'c:\\Users\\Administrator\\Downloads\\Unsitio-Figma-Clean\\scripts\\lab_dashboard\\server\\server.js';
const ARCHIVE_LIST_ENDPOINT = `
// ==========================================
// ARCHIVE LIST ENDPOINT (Injected)
// ==========================================
app.get('/api/archive/list', async (req, res) => {
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
                dirs.push({ 
                    id: item,
                    path: itemPath,
                    archivedAt: stat.mtime
                });
            }
        }
        
        res.json(dirs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
`;

try {
    let content = fs.readFileSync(SERVER_FILE, 'utf8');

    // Check if checks already exists
    if (content.includes("/api/archive/list")) {
        console.log("Endpoint already exists!");
        process.exit(0);
    }

    // Robust insertion: Find the Trash endpoint start
    // Using simple substring index
    const trashStart = "app.post('/api/trash'";
    const idx = content.indexOf(trashStart);

    if (idx === -1) {
        console.error("Could not find app.post('/api/trash' to insert before.");
        process.exit(1);
    }

    // Split and insert
    const before = content.substring(0, idx);
    const after = content.substring(idx);
    const newContent = before + "\n" + ARCHIVE_LIST_ENDPOINT + "\n" + after;

    fs.writeFileSync(SERVER_FILE, newContent);
    console.log("Successfully injected /api/archive/list endpoint.");

} catch (e) {
    console.error("Error:", e);
    process.exit(1);
}
