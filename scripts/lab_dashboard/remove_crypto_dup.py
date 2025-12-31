
path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
crypto_seen = False

for line in lines:
    if "const crypto = require('crypto');" in line:
        if not crypto_seen:
            # First time is okay (line 601 usually)
            new_lines.append(line)
            crypto_seen = True
            print(f"Kept crypto at line {len(new_lines)}")
        else:
            # Duplicate
            print("Removed duplicate crypto")
            # Don't append
    else:
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
