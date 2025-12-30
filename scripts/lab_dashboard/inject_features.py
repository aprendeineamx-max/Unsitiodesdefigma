
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
deps_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\deps_terminal.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(deps_path, 'r', encoding='utf-8') as f:
    deps_code = f.read()

# 1. Update require('child_process')
if "const { spawn } = require('child_process');" in server_code:
    server_code = server_code.replace(
        "const { spawn } = require('child_process');", 
        "const { spawn, exec } = require('child_process');"
    )
elif "const { exec } = require('child_process');" not in server_code:
    # If not found (unlikely given genesis), inject it at top
    server_code = "const { exec } = require('child_process');\n" + server_code

# 2. Inject deps code before server.listen
# Find position of "const PORT ="
idx = server_code.find("const PORT =")
if idx == -1:
    print("Could not find insertion point")
    exit(1)

# Remove the import line from deps_code if present (to avoid dupe)
deps_code = deps_code.replace("const { exec } = require('child_process');", "")

new_code = server_code[:idx] + "\n" + deps_code + "\n" + server_code[idx:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Features injected successfully.")
