
path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check for lines that start with 4 spaces (standard indent) vs 0
# If we see a block of API definitions indented, it means previous wasn't closed.
for i, line in enumerate(lines):
    if "app.post(" in line or "app.get(" in line:
        if line.startswith("    app."):
            print(f"WARNING: Indented route definition at line {i+1}: {line.strip()}")
