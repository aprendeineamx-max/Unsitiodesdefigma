
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
watcher_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\watcher_features.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(watcher_path, 'r', encoding='utf-8') as f:
    watcher_code = f.read()

# Inject watcher code before server.listen, replacing old stubs if any
# We look for "app.post('/api/watch/start'..."
if "app.post('/api/watch/start'" in server_code:
    # Remove old stubs. Note: simplistic replacement via regex or just assume inject at bottom triggers overwrite?
    # Express uses FIRST match. So if we inject at TOP (after imports), it takes precedence?
    # Or we remove old ones.
    # Let's simple remove the old lines if they match exact string from `deps_terminal.js`
    server_code = server_code.replace("app.post('/api/watch/start', (req, res) => {\n    res.json({ success: true, message: 'Watcher started (simulated)' });\n});", "")
    server_code = server_code.replace("app.post('/api/watch/stop', (req, res) => {\n    res.json({ success: true, message: 'Watcher stopped' });\n});", "")

# Inject new code
idx = server_code.find("const PORT =")
new_code = server_code[:idx] + "\n" + watcher_code + "\n" + server_code[idx:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Watcher features injected successfully.")
