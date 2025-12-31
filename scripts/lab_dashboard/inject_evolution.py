
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
evolution_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\evolution_features.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(evolution_path, 'r', encoding='utf-8') as f:
    evol_code = f.read()

# Inject Evolution AFTER Creation features
# We can search for the start of ROUTES again, or find the end of the last injection.
# Creation was injected before "app.get('/api/versions'".
# We should probably inject BEFORE that too, pushing Creation down? 
# Or just find "app.get('/api/versions'" again and insert before it, 
# effectively putting Evolution AFTER Creation (block-wise) if Creation is already there.

target = "app.get('/api/versions'"
idx = server_code.find(target)

if idx == -1:
    print("Insertion point not found")
    exit(1)

# Just insert
new_code = server_code[:idx] + "\n" + evol_code + "\n\n" + server_code[idx:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Evolution features injected.")
