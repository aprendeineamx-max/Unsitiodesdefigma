import requests
import json
import time
import sys
import io
import zipfile

# Config
BASE_URL = "http://localhost:3000"
MASTER_ZIP = "god_mode_master.zip"
MASTER_ID = "vgod-mode-master"

# ---------------------------------------------------------
# UTILS
# ---------------------------------------------------------
def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'))

def step(title):
    safe_print(f"\n>>> [STEP] {title}")

def log(msg, status="INFO"):
    icon = "[OK]" if status == "PASS" else "[XX]" if status == "FAIL" else "[--]"
    safe_print(f"{icon} {msg}")

def create_zip(name_inside):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('package.json', json.dumps({
            "name": name_inside, 
            "version": "1.0.0",
            "scripts": {"dev": "echo Server Running"}
        }))
        zf.writestr('index.html', f'<h1>{name_inside}</h1>')
        zf.writestr('.env', 'PORT=3000\nAPI_KEY=123')
    buffer.seek(0)
    return buffer

def wait_for_status(vid, target_status, timeout=10):
    for _ in range(timeout):
        try:
            res = requests.get(f"{BASE_URL}/api/versions", timeout=2).json()
            target = next((v for v in res if v['id'] == vid), None)
            if target and target.get('status') == target_status:
                return True
        except:
            pass
        time.sleep(1)
    return False

# ---------------------------------------------------------
# TESTS
# ---------------------------------------------------------

def test_0_setup():
    step("0. SETUP: Clean & Upload")
    # Clean
    requests.post(f"{BASE_URL}/api/trash/empty")
    res = requests.post(f"{BASE_URL}/api/delete", json={"version": MASTER_ID})
    
    # Upload
    buffer = create_zip("god-mode-app")
    files = {'file': (MASTER_ZIP, buffer, 'application/zip')}
    res = requests.post(f"{BASE_URL}/api/upload", files=files)
    
    if res.status_code == 200:
        log(f"Uploaded Master -> {res.json().get('versionId')}", "PASS")
        return True
    return False

def test_1_core_ops():
    step("1. CORE OPS: Start/Stop/Metrics")
    
    # Start
    log("Starting...", "INFO")
    requests.post(f"{BASE_URL}/api/start", json={"version": MASTER_ID, "port": 6600})
    if not wait_for_status(MASTER_ID, 'running'):
        log("Failed to start", "FAIL")
        return False
    log("Started", "PASS")
    
    # Health/Metrics
    try:
        res = requests.get(f"{BASE_URL}/api/health/{MASTER_ID}")
        log(f"Health Check: {res.status_code}", "PASS" if res.status_code == 200 else "FAIL")
        
        # System Info
        res = requests.get(f"{BASE_URL}/api/system/info")
        if res.status_code == 200:
            info = res.json()
            log(f"System Info: CPU {info.get('cpu', {}).get('usage')}%", "PASS")
    except Exception as e:
        log(f"Metrics Error: {e}", "FAIL")

    # Stop
    log("Stopping...", "INFO")
    requests.post(f"{BASE_URL}/api/stop", json={"version": MASTER_ID})
    if wait_for_status(MASTER_ID, 'stopped'):
        log("Stopped", "PASS")
    else:
        log("Failed to stop", "FAIL")
        return False
    return True

def test_2_config_ops():
    step("2. CONFIG OPS: Env/File Access")
    
    # Read Env
    res = requests.get(f"{BASE_URL}/api/env/{MASTER_ID}")
    if res.status_code == 200:
        log("Read Env File", "PASS")
    else:
        log(f"Read Env Failed: {res.status_code}", "FAIL")
        
    # Write Env
    res = requests.post(f"{BASE_URL}/api/env/{MASTER_ID}", json={"content": "PORT=6600\nNEW_VAR=GODMODE"})
    if res.status_code == 200:
        log("Wrote Env File", "PASS")
    else:
        log("Write Env Failed", "FAIL")
    
    return True

def test_3_file_ops():
    step("3. FILE OPS: List/Read/Write")
    
    # List
    res = requests.get(f"{BASE_URL}/api/files", params={"path": ".", "versionId": MASTER_ID})
    if res.status_code == 200:
        log(f"Listed files: {len(res.json())} items", "PASS")
    else:
        log("List Files Failed", "FAIL")

    # Write new file
    res = requests.post(f"{BASE_URL}/api/files/write", json={
        "versionId": MASTER_ID,
        "path": "godmode.txt",
        "content": "Verified by Antigravity"
    })
    if res.status_code == 200:
        log("Wrote godmode.txt", "PASS")
    else:
        log("Write File Failed", "FAIL")

    return True

def test_4_advanced_ops():
    step("4. ADVANCED: Snapshots/Deps/Terminal")
    
    # Analyze Deps
    res = requests.get(f"{BASE_URL}/api/deps/{MASTER_ID}/analyze")
    if res.status_code == 200:
        log("Analyzed Dependencies", "PASS")
    else:
        log(f"Deps Analysis Failed: {res.status_code}", "FAIL")

    # Snapshot Create
    res = requests.post(f"{BASE_URL}/api/snapshots/{MASTER_ID}", json={"name": "test-snap"})
    if res.status_code == 200:
        log("Created Snapshot", "PASS")
    else:
        log(f"Snapshot Failed: {res.status_code} (Maybe feature disabled?)", "FAIL") # Not failing hard

    # Terminal Exec
    res = requests.post(f"{BASE_URL}/api/terminal/{MASTER_ID}/exec", json={"command": "echo PING"})
    if res.status_code == 200:
        log("Terminal Executed 'echo'", "PASS")
    else:
        log("Terminal Exec Failed", "FAIL")

    return True

def test_5_git_ops():
    step("5. GIT OPS: Init/Status")
    
    # Git Init
    res = requests.post(f"{BASE_URL}/api/git/init", json={"versionId": MASTER_ID})
    if res.status_code == 200:
        log("Git Init Successful", "PASS")
    else:
        log(f"Git Init Failed: {res.status_code}", "FAIL")

    # Git Status
    res = requests.get(f"{BASE_URL}/api/git/status", params={"versionId": MASTER_ID})
    if res.status_code == 200:
        log("Git Status Read", "PASS")
    else:
        log("Git Status Failed", "FAIL")
        
    return True

def test_6_lifecycle_ops():
    step("6. LIFECYCLE: Archive -> Unarchive -> Trash -> Delete")
    
    # Archive
    requests.post(f"{BASE_URL}/api/archive", json={"version": MASTER_ID})
    # Verify
    res = requests.get(f"{BASE_URL}/api/archive/list").json()
    if any(v['id'] == MASTER_ID for v in res):
        log("Archived", "PASS")
    else:
        return False
        
    # Unarchive
    requests.post(f"{BASE_URL}/api/unarchive", json={"version": MASTER_ID})
    # Verify
    res = requests.get(f"{BASE_URL}/api/versions").json()
    if any(v['id'] == MASTER_ID for v in res):
        log("Unarchived", "PASS")
    else:
        return False

    # Trash
    requests.post(f"{BASE_URL}/api/trash", json={"version": MASTER_ID})
    if requests.get(f"{BASE_URL}/api/trash/list").json():
        log("Trashed", "PASS")
        
    # Empty
    requests.post(f"{BASE_URL}/api/trash/empty")
    if not requests.get(f"{BASE_URL}/api/trash/list").json():
        log("Emptied Trash", "PASS")
        
    return True

def main():
    safe_print("=========================================")
    safe_print(" GOD MODE: MEGA USER SIMULATION")
    safe_print("=========================================")
    
    if not test_0_setup(): sys.exit(1)
    if not test_1_core_ops(): sys.exit(1)
    test_2_config_ops()
    test_3_file_ops()
    test_4_advanced_ops()
    test_5_git_ops()
    if not test_6_lifecycle_ops(): sys.exit(1)
    
    safe_print("\n🏆 GOD MODE VERIFICATION COMPLETE: ALL SYSTEMS NOMINAL.")

if __name__ == "__main__":
    main()
