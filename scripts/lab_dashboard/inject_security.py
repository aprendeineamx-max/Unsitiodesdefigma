
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
security_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\security_features.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(security_path, 'r', encoding='utf-8') as f:
    sec_code = f.read()

# Inject Security Middleware AT THE TOP (after app init)
# We look for "const app = express();"
# Then "app.use(express.json());"
idx = server_code.find("app.use(express.json());")
if idx == -1:
    print("Could not find insertion point")
    exit(1)

# Insert AFTER json middleware
insertion_point = idx + len("app.use(express.json());")
new_code = server_code[:insertion_point] + "\n\n" + sec_code + "\n" + server_code[insertion_point:]

with open(server_path, 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Security features injected successfully.")
