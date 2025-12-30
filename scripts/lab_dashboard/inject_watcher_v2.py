
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
watcher_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\watcher_features_v2.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(watcher_path, 'r', encoding='utf-8') as f:
    watcher_code = f.read()

# Replace previous watcher injection or inject new
if "// WATCHER FEATURES" in server_code:
    # Need to remove the old block.
    # It started with // WATCHER FEATURES and included chokidar...
    # We will just append the NEW code at the end (before server.listen) 
    # and overwrite the Routes by re-declaring them? Express allows overwriting?
    # No, Express executes first match.
    # We must remove the old routes.
    # Simple strategy: Read file, remove lines between // WATCHER FEATURES and // GIT FEATURES ADVANCED (if it exists)
    # But I don't know the order.
    # I will rely on "replace_file_content" if I knew line numbers.
    # Logic: String replace the EXACT Previous content?
    # I don't have the exact previous content string easily.
    pass

# We will inject at the TOP of the routes section, essentially implementing routes that MIGHT conflict but if placed earlier, they win?
# No, usually route order matters.
# I will use a marker.
# Actually, I used "inject_watcher.py" before.
# I can use that same script logic but with new content?
# server code currently HAS the "Watcher Features".
# I need to REPLACE it.
 
# Let's find the header.
start_marker = "// WATCHER FEATURES"
end_marker = "// GIT FEATURES ADVANCED" # Assuming I injected Git Adv AFTER?
# Or maybe I injected Watcher AFTER Git Adv?
# I injected Watcher LAST (Step 5128).
# So Watcher is almost at the top of the insertion point (before server.listen).

# Let's just find "const chokidar =" and replace from there to the next known block or end.
# This makes it complex.

# Simpler: The server.js is transient.
# I will just write a new server.js if needed.
# But I have many features.
# I will try to find the block visually?
# No.
# I will just APPEND the new routes with unique paths?
# No, I need /api/watch/start to behave differently.
 
# Valid strategy: Read the file, identify the block via string matching (approximate), replace it.
# The block starts with "const chokidar = require('chokidar');"
# And ends... where?
# It was injected before "server.listen".
# So it's likely near the end of the "Routes" section.

# I will use `replace` function in python with the OLD content from `watcher_features.js` (Step 5126)
pass

old_watcher_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\watcher_features.js"
with open(old_watcher_path, 'r', encoding='utf-8') as f:
    old_content = f.read()

if old_content in server_code:
    server_code = server_code.replace(old_content, watcher_code)
    print("Replaced old watcher code.")
else:
    # If exact match fails (newlines etc), force append
    print("Could not find exact match. Appending new code (Might cause duplicate routes).")
    idx = server_code.find("const PORT =")
    server_code = server_code[:idx] + "\n" + watcher_code + "\n" + server_code[idx:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(server_code)

print("Watcher V2 features injected.")
