
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
time_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\time_features.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(time_path, 'r', encoding='utf-8') as f:
    time_code = f.read()

# Inject Time AFTER Communication features
# Search for "app.get('/api/comms/telemetry/:versionId'"
target = "app.get('/api/comms/telemetry/:versionId'"
idx = server_code.find(target)

if idx == -1:
    print("Communication endpoint not found, falling back")
    exit(1)

end_of_route = server_code.find("});", idx)
if end_of_route != -1:
    idx = end_of_route + 3

new_code = server_code[:idx] + "\n\n" + time_code + "\n" + server_code[idx:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Time features injected.")
