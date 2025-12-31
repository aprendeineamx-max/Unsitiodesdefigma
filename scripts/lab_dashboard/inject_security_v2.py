
import os

server_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\server\server.js"
security_path = r"c:\Users\Administrator\Downloads\Unsitio-Figma-Clean\scripts\lab_dashboard\security_features_v2.js"

with open(server_path, 'r', encoding='utf-8') as f:
    server_code = f.read()

with open(security_path, 'r', encoding='utf-8') as f:
    sec_code = f.read()

# Replace previous security code if exists
start_marker = "// ==========================================\n// SECURITY FEATURES"
end_marker = "app.use((req, res, next) => {\n    const ip = req.ip || req.connection.remoteAddress;" # Identifying part of rate limit

# Since we don't have a clean block end, we might just look for the block we injected previously.
# Previous injection was:
# // ==========================================
# // SECURITY FEATURES
# // ==========================================
# const rateLimit = new Map();
# ...
# ...
# app.use((req, res, next) => {\n    const ip = req.ip; ...
# ...
#     next();\n});

# We will try to replace the whole block if found.
# If not found, we inject after app.use(express.json());

# Strategy: Remove old block by finding known strings?
# Or just overwrite server.js completely if we had a backup? No backup.

# Let's use string replacement for the start/end known logic.
# Identifying the end of the previous block is tricky (it ends with });).
# But we know it was inserted before other routes.
# Let's just find the start:
idx_start = server_code.find("// SECURITY FEATURES") - 45 # approx to include header
# The header usually has ==================
if idx_start < 0:
    idx_start = server_code.find("// ==========================================\n// SECURITY FEATURES")

if idx_start > -1:
    # We found it. Now where does it end?
    # It ends before "// ROUTES" or whatever was there?
    # No, we injected it after express.json().
    # The next thing likely is "const LABS_DIR =" OR "const activeProcesses =" 
    # NO. "const LABS_DIR =" is definitely after `app.use(express.json())` usually, 
    # but in our specific file lines 21 is LABS_DIR.
    # Lines 19 is app.use(express.json()).
    # So we injected it BETWEEN 19 and 21. 
    # So it should be easy to replace everything between those points?
    
    # Wait, our `server.js` view in Step 5187 showed:
    # 19: app.use(express.json());
    # 21: const LABS_DIR = ...
    # So if we inject AGAIN, we are expanding that space.
    # The OLD code is already there (from Step 5274).
    # So we should Look for "const LABS_DIR =" and replace everything from "app.use(express.json());" to that?
    # No, that would delete imports if they were there?
    pass

# Safe strategy:
# Find "const LABS_DIR ="
# Find "app.use(express.json());"
# Replace everything in between with the NEW code + some newlines.

idx_json = server_code.find("app.use(express.json());")
idx_labs = server_code.find("const LABS_DIR =")

if idx_json != -1 and idx_labs != -1:
    new_code = server_code[:idx_json + len("app.use(express.json());")] + "\n\n" + sec_code + "\n\n" + server_code[idx_labs:]
    with open(server_path, 'w', encoding='utf-8') as f:
        f.write(new_code)
    print("Security features V2 injected (replaced old).")
else:
    print("Could not find markers.")
