
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
git_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\git_features.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(git_path, 'r', encoding='utf-8') as f:
    git_code = f.read()

# Inject git code before server.listen
idx = server_code.find("const PORT =")
if idx == -1:
    print("Could not find insertion point")
    exit(1)

new_code = server_code[:idx] + "\n" + git_code + "\n" + server_code[idx:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Git features injected successfully.")
