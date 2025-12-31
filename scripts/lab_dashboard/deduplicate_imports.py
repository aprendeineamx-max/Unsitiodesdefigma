
path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
seen = {'crypto': False, 'http': False, 'fs': False, 'path': False}

# We assume the first occurrence of these standard libs is the global one we want to keep.
# Subsequents are duplicates from un-nesting.

for line in lines:
    clean_line = line.strip()
    is_dup = False
    
    for lib in seen.keys():
        if f"const {lib} = require('{lib}');" in clean_line or f'const {lib} = require("{lib}");' in clean_line:
            if seen[lib]:
                print(f"Removing duplicate {lib} at line")
                is_dup = True
            else:
                seen[lib] = True
                print(f"Keeping first {lib}")
    
    if not is_dup:
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
