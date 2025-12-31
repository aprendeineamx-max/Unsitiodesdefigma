
path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

open_b = 0
for char in c:
    if char == '{': open_b += 1
    elif char == '}': open_b -= 1

print(f"Brace Balance: {open_b}")
# If positive, we need }
# If negative, we have too many }
