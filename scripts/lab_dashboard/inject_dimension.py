
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
dim_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\dimension_features.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(dim_path, 'r', encoding='utf-8') as f:
    dim_code = f.read()

# Inject Dimension AFTER Time features
target = "app.post('/api/time/big-bang'"
idx = server_code.find(target)

if idx == -1:
    print("Time endpoint not found, falling back")
    exit(1)

end_of_route = server_code.find("});", idx)
if end_of_route != -1:
    idx = end_of_route + 3

new_code = server_code[:idx] + "\n\n" + dim_code + "\n" + server_code[idx:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Dimension features injected.")
