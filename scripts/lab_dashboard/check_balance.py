
path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Count balance
open_b = 0
for char in c:
    if char == '{': open_b += 1
    elif char == '}': open_b -= 1

print(f"Post-Fix Balance: {open_b}")
# If negative, we have too many } (likely from my previous append + this new insert)
