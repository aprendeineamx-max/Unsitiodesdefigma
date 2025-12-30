
import os

path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"

with open(path, 'rb') as f:
    content = f.read()

# Try to decode as utf-8, ignoring errors to handle garbage
text = content.decode('utf-8', errors='ignore')

# Find the start of api/delete to replace/rewrite it cleanly
delete_marker = "app.post('/api/delete',"
idx = text.rfind(delete_marker)

if idx == -1:
    print("Could not find api/delete marker")
    exit(1)

# Truncate before delete
clean_text = text[:idx]

# Append valid Delete endpoint (with await stopProcess) and Server Listen
new_end = r"""
app.post('/api/delete', async (req, res) => {
    try {
        const { version } = req.body;
        if (!version) return res.status(400).json({ error: 'Missing version' });

        const sourcePath = path.join(LABS_DIR, version);

        if (!fs.existsSync(sourcePath)) {
            return res.status(404).json({ error: 'Version not found' });
        }

        // Stop process if running
        await stopProcess(version);

        // Permanently delete
        await fs.remove(sourcePath);

        broadcastLog('system', `❌ Permanently deleted ${version}`, 'error');
        broadcastState();

        // Emit action event for GUI sync
        io.emit('action', {
            type: 'ZIP_DELETED',
            versionId: version,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Lab Dashboard API running on http://localhost:${PORT}`);
    broadcastLog('system', `🚀 Server started on port ${PORT}`, 'success');
});
"""

final_text = clean_text + new_end

with open(path, 'w', encoding='utf-8') as f:
    f.write(final_text)

print("Server.js repaired successfully.")
