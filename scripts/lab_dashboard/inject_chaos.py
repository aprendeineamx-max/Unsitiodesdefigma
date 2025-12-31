
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
chaos_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\chaos_features.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(chaos_path, 'r', encoding='utf-8') as f:
    chaos_code = f.read()

# Inject Chaos AFTER Security, BEFORE routes
# Look for "const activeProcesses ="
idx = server_code.find("const activeProcesses =")
if idx == -1:
    print("Insertion point not found")
    exit(1)

new_code = server_code[:idx] + chaos_code + "\n\n" + server_code[idx:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Chaos features injected.")
