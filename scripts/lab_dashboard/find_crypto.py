
path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const crypto =" in line:
        print(f"Line {i+1}: {line.strip()}")
