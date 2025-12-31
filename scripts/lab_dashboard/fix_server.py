
path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Count balance
open_b = 0
for char in c:
    if char == '{': open_b += 1
    elif char == '}': open_b -= 1

print(f"Current Balance: {open_b}")

if open_b > 0:
    print(f"Appending {open_b} closing braces...")
    with open(path, 'a', encoding='utf-8') as f:
        f.write("\n" + ("}\n" * open_b))
    print("Fixed.")
else:
    print("Balance is zero or negative.")
