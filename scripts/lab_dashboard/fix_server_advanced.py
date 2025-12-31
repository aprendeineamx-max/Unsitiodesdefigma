
path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Stack based checker is better for matching
stack = []
line_num = 1
col_num = 0

for char in c:
    col_num += 1
    if char == '\n':
        line_num += 1
        col_num = 0
    
    if char in '{[(':
        stack.append((char, line_num, col_num))
    elif char in '}])':
        if not stack:
            print(f"Error: Unexpected closing {char} at {line_num}:{col_num}")
        else:
            last, l, col = stack.pop()
            if (last == '{' and char != '}') or \
               (last == '[' and char != ']') or \
               (last == '(' and char != ')'):
                print(f"Error: Mismatched {last} (from {l}:{col}) with {char} at {line_num}:{col_num}")

if stack:
    print(f"Error: Unexpected end of input. Unclosed items:")
    for item in stack:
        print(f"  {item[0]} at line {item[1]}")
    
    # Suggest fix
    print("\nSuggested Append:")
    fix = ""
    for item in reversed(stack):
        if item[0] == '{': fix += "}"
        elif item[0] == '[': fix += "]"
        elif item[0] == '(': fix += ")"
    print(fix)
    
    with open(path, 'a', encoding='utf-8') as f:
        f.write("\n" + fix)
        print("Applied fix.")

else:
    print("Syntax balance seems OK (ignoring strings/comments context)")
