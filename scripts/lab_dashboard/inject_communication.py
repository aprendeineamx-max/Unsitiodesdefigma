
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
comm_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\communication_features.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(comm_path, 'r', encoding='utf-8') as f:
    comm_code = f.read()

# Inject Communication AFTER Evolution features
# Search for "app.get('/api/evolution/log'" which is the last endpoint in Evolution
target = "app.get('/api/evolution/log'"
idx = server_code.find(target)

if idx == -1:
    # If not found (maybe Evolution not injected correctly?), fallback to Routes start
    print("Evolution endpoint not found, falling back to Routes start")
    target = "app.get('/api/versions'"
    idx = server_code.find(target)
else:
    # Move index to after the block (search for closing brace of that function + some buffer)
    # The evol log function is:
    # app.get('/api/evolution/log', (req, res) => {
    #     res.json({ 
    #         state: evolutionState, 
    #         history: evolutionState.adaptations 
    #     });
    # });
    # 
    # Simple search for the next "app." or similar?
    # Or just insert before the Process Manager functions?
    
    # Let's search for "PROCESS MANAGER" comment if it exists?
    # Or just insert right after the Evolution block. 
    # Let's use `app.get('/api/evolution/log'` start index, find the `});`
    
    end_of_route = server_code.find("});", idx)
    if end_of_route != -1:
        idx = end_of_route + 3 # }); length

if idx == -1:
    print("Insertion point not found")
    exit(1)

new_code = server_code[:idx] + "\n\n" + comm_code + "\n" + server_code[idx:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Communication features injected.")
