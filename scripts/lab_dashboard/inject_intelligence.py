
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
intel_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\intelligence_features.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(intel_path, 'r', encoding='utf-8') as f:
    intel_code = f.read()

# Inject Intelligence AFTER "const activeProcesses = new Map();"
# This allows access to activeProcesses
target = "const activeProcesses = new Map();"
idx = server_code.find(target)

if idx == -1:
    print("Insertion point not found")
    exit(1)

# Find the end of the line
end_idx = server_code.find("\n", idx)

new_code = server_code[:end_idx+1] + "\n" + intel_code + "\n" + server_code[end_idx+1:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Intelligence features injected.")
