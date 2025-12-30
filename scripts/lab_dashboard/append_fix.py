
import os

path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"

with open(path, 'a', encoding='utf-8') as f:
    f.write("\n}}});\n")

print("Appended closing braces.")
