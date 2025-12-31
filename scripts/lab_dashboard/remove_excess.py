
path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove last 2 occurrences of '}' considering whitespace
# Actually, the file probably ends with some newlines and then the braces I appended.
# Let's just find the last braces.

c_list = list(c)
removed = 0
for i in range(len(c_list) - 1, -1, -1):
    if c_list[i] == '}':
        c_list[i] = '' # Remove
        removed += 1
        if removed == 2:
            break

if removed == 2:
    print("Removed 2 excess closing braces.")
    with open(path, 'w', encoding='utf-8') as f:
        f.write("".join(c_list))
else:
    print(f"Could not find 2 braces, only found {removed}")
