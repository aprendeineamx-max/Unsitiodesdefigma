
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
creation_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\creation_features.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(creation_path, 'r', encoding='utf-8') as f:
    create_code = f.read()

# Inject Creation AFTER Intelligence features
# We look for the last injection point or just append before routes
# "const activeProcesses" is a safe anchor, but we want to be clean.
# Let's search for "INTELLIGENCE FEATURES" block to place after it?
# Or just use "app.use(express.urlencoded" anchor? No.

# Intelligence was inserted after "const activeProcesses = new Map();"
# Let's insert Creation after Intelligence block.
# We can search for the start of ROUTES "app.get('/api/versions'" verify that exists.

target = "app.get('/api/versions'"
idx = server_code.find(target)

if idx == -1:
    print("Insertion point not found")
    exit(1)

new_code = server_code[:idx] + "\n" + create_code + "\n\n" + server_code[idx:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Creation features injected.")
