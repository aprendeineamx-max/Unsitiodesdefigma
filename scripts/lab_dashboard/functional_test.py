import requests
import json
import time
import sys
import os
import zipfile
import io

# Config
BASE_URL = "http://localhost:3000"
TEST_ZIP_NAME = "checklist_user_simulation_v99.zip"
TEST_VERSION_ID = "vchecklist-user-simulation-v99"  # Expected ID from server logic

# Unicode safe printing for Windows
def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'))

def step(name):
    safe_print(f"\n>>> STEP: {name}")

def log(msg, status="INFO"):
    icon = "[OK]" if status == "PASS" else "[XX]" if status == "FAIL" else "[--]"
    safe_print(f"{icon} {msg}")

def create_dummy_zip():
    step("Creating dummy ZIP for Upload Test")
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('package.json', '{"name": "test-app", "scripts": {"dev": "echo Server Running"}}')
        zf.writestr('index.html', '<h1>Hello World</h1>')
    
    buffer.seek(0)
    return buffer

def wait_for_status(vid, target_status, timeout=10):
    for _ in range(timeout):
        res = requests.get(f"{BASE_URL}/api/versions").json()
        target = next((v for v in res if v['id'] == vid), None)
        if target and target.get('status') == target_status:
            return True
        time.sleep(1)
    return False

# ==========================================
# TESTS
# ==========================================

def test_1_upload():
    step("1. User Uploads a File")
    
    # Clean up if exists
    requests.post(f"{BASE_URL}/api/delete", json={"version": TEST_VERSION_ID})
    
    zip_buffer = create_dummy_zip()
    files = {'file': (TEST_ZIP_NAME, zip_buffer, 'application/zip')}
    
    try:
        res = requests.post(f"{BASE_URL}/api/upload", files=files)
        if res.status_code == 200:
            log(f"Upload successful. Response: {res.json()}", "PASS")
        else:
            log(f"Upload failed: {res.text}", "FAIL")
            return False
            
        # Verify in list
        res = requests.get(f"{BASE_URL}/api/versions").json()
        found = any(v['id'] == TEST_VERSION_ID for v in res)
        if found:
            log(f"Version {TEST_VERSION_ID} found in Dashboard", "PASS")
            return True
        else:
            log(f"Version {TEST_VERSION_ID} NOT found in Dashboard", "FAIL")
            return False
            
    except Exception as e:
        log(f"Exception during upload: {e}", "FAIL")
        return False

def test_2_start_stop():
    step(f"2. User Starts and Stops {TEST_VERSION_ID}")
    
    # START
    log("Clicking Start...", "INFO")
    res = requests.post(f"{BASE_URL}/api/start", json={"version": TEST_VERSION_ID, "port": 0})
    if res.status_code != 200:
        log("Start request failed", "FAIL")
        return False
        
    if wait_for_status(TEST_VERSION_ID, 'running', 15):
        log("Server status changed to 'running'", "PASS")
    else:
        log("Server timed out waiting for 'running' state", "FAIL")
        # Proceeding anyway to try stop
        
    # STOP
    log("Clicking Stop...", "INFO")
    res = requests.post(f"{BASE_URL}/api/stop", json={"version": TEST_VERSION_ID})
    
    if wait_for_status(TEST_VERSION_ID, 'stopped', 10):
        log("Server status changed to 'stopped'", "PASS")
        return True
    else:
        log("Server timed out waiting for 'stopped' state", "FAIL")
        return False

def test_3_archive_lifecycle():
    step("3. User Archives and Restores Project")
    
    vid = TEST_VERSION_ID
    
    # ARCHIVE
    log("Clicking Archive...", "INFO")
    res = requests.post(f"{BASE_URL}/api/archive", json={"version": vid})
    if res.status_code != 200:
        log(f"Archive failed: {res.text}", "FAIL")
        return False
        
    # Verify GONE from Dashboard
    res = requests.get(f"{BASE_URL}/api/versions").json()
    if any(v['id'] == vid for v in res):
        log("Item still in Dashboard!", "FAIL")
        return False
    log("Item removed from Dashboard", "PASS")
    
    # Verify PRESENT in Archive List
    res = requests.get(f"{BASE_URL}/api/archive/list").json()
    if any(v['id'] == vid for v in res):
        log("Item found in Archive List", "PASS")
    else:
        log("Item NOT found in Archive List", "FAIL")
        return False
        
    # RESTORE (Using our new endpoint)
    log("Clicking Restore (Unarchive)...", "INFO")
    res = requests.post(f"{BASE_URL}/api/unarchive", json={"version": vid})
    if res.status_code != 200:
        log(f"Unarchive failed: {res.text}", "FAIL")
        return False
        
    # Verify BACK in Dashboard
    res = requests.get(f"{BASE_URL}/api/versions").json()
    if any(v['id'] == vid for v in res):
        log("Item reappeared in Dashboard", "PASS")
        return True
    else:
        log("Item NOT back in Dashboard", "FAIL")
        return False

def test_4_trash_lifecycle():
    step("4. User Trashes and Empties Trash")
    
    vid = TEST_VERSION_ID
    
    # TRASH
    log("Clicking Trash...", "INFO")
    requests.post(f"{BASE_URL}/api/trash", json={"version": vid})
    
    # Verify in Trash List
    res = requests.get(f"{BASE_URL}/api/trash/list").json()
    if any(v['id'] == vid for v in res):
        log("Item found in Trash List", "PASS")
    else:
        log("Item NOT found in Trash List", "FAIL")
        return False
        
    # EMPTY TRASH
    log("Clicking Empty Trash...", "INFO")
    requests.post(f"{BASE_URL}/api/trash/empty")
    
    # Verify Trash Empty
    res = requests.get(f"{BASE_URL}/api/trash/list").json()
    if len(res) == 0:
        log("Trash is now empty", "PASS")
    else:
        log("Trash NOT empty", "FAIL")
        
    # Verify File Gone Forever
    res = requests.get(f"{BASE_URL}/api/versions").json()
    if not any(v['id'] == vid for v in res):
        log("Item correctly gone from system", "PASS")
        return True
    else:
        log("Item still exists somewhere!", "FAIL")
        return False

def main():
    safe_print("=========================================")
    safe_print(" USER SIMULATION TEST SUITE v2.0")
    safe_print("=========================================")
    
    if not test_1_upload(): sys.exit(1)
    if not test_2_start_stop(): sys.exit(1)
    if not test_3_archive_lifecycle(): sys.exit(1)
    if not test_4_trash_lifecycle(): sys.exit(1)
    
    safe_print("\nAll User Journeys Completed Successfully!")

if __name__ == "__main__":
    main()
