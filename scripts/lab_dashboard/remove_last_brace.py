
path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Find the LAST '}' and remove it
last_brace_index = c.rfind('}')
if last_brace_index != -1:
    new_c = c[:last_brace_index] + c[last_brace_index+1:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_c)
    print("Removed last }")
else:
    print("No } found")
