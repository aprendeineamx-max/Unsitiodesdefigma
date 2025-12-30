
import os

path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Find PORT definition
marker = "const PORT = 3000;"
idx = text.rfind(marker)

if idx == -1:
    print("Marker not found")
    exit(1)

# Find the end of server.listen
# It looks like: server.listen(PORT, ... });
# We search for "});" AFTER the marker
end_marker = "});"
end_idx = text.find(end_marker, idx)

if end_idx == -1:
    print("End marker not found")
    exit(1)

# Keep text up to end_marker + len(end_marker)
clean_text = text[:end_idx + len(end_marker)]

with open(path, 'w', encoding='utf-8') as f:
    f.write(clean_text)

print("Server tail cleaned.")
