
import re

path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

balance_brace = 0
balance_paren = 0
line_num = 1
stack = []

for char in text:
    if char == '\n':
        line_num += 1
    elif char == '{':
        balance_brace += 1
        stack.append(('{', line_num))
    elif char == '}':
        balance_brace -= 1
        if stack and stack[-1][0] == '{':
            stack.pop()
    elif char == '(':
        balance_paren += 1
        stack.append(('(', line_num))
    elif char == ')':
        balance_paren -= 1
        if stack and stack[-1][0] == '(':
            stack.pop()

print(f"Brace Balance: {balance_brace}")
print(f"Paren Balance: {balance_paren}")
if stack:
    print(f"Last Unclosed Item: {stack[-1]} (Total unclosed: {len(stack)})")
