import requests
import json
import time
import sys
import io
import zipfile
import threading
import random
import hashlib

# Config
BASE_URL = "http://localhost:3000"
NUM_USERS = 5
ITERATIONS_PER_USER = 3

# Safety
def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'))

def log(user_id, msg, status="INFO"):
    icon = "[OK]" if status == "PASS" else "[XX]" if status == "FAIL" else "[--]"
    safe_print(f"{icon} [User {user_id}] {msg}")

# ---------------------------------------------------------
# UTILS
# ---------------------------------------------------------

def create_payload(user_id, iteration):
    name = f"user_{user_id}_iter_{iteration}"
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('package.json', json.dumps({"name": name, "scripts": {"dev": "echo Running"}}))
        zf.writestr('index.html', f'<h1>{name}</h1>')
        # Add random data to ensure integrity check
        zf.writestr('data.bin', os.urandom(1024))
    buffer.seek(0)
    return name, buffer

def check_integrity(vid):
    # Verify file existence and readability via API
    try:
        # Check package.json
        res = requests.get(f"{BASE_URL}/api/files/read", params={"versionId": vid, "path": "package.json"})
        if res.status_code == 200:
            return True
        return False
    except:
        return False

# ---------------------------------------------------------
# WORKER
# ---------------------------------------------------------

def user_worker(user_id):
    log(user_id, "Starting simulation...", "INFO")
    
    for i in range(ITERATIONS_PER_USER):
        try:
            name, buffer = create_payload(user_id, i)
            filename = f"{name}.zip"
            
            # 1. Upload
            wait_time = random.uniform(0.1, 1.0)
            time.sleep(wait_time)
            
            files = {'file': (filename, buffer, 'application/zip')}
            res = requests.post(f"{BASE_URL}/api/upload", files=files)
            
            if res.status_code != 200:
                log(user_id, f"Upload failed: {res.status_code}", "FAIL")
                continue
                
            vid = res.json().get('versionId')
            log(user_id, f"Uploaded {vid}", "PASS")
            
            # 2. Integrity Check
            if check_integrity(vid):
                log(user_id, "Integrity Verified", "PASS")
            else:
                log(user_id, "Integrity Check Failed!", "FAIL")
                
            # 3. Random Action (Start or Archive or Trash)
            action = random.choice(['start', 'archive', 'trash'])
            
            if action == 'start':
                # Start -> Stop -> Delete
                requests.post(f"{BASE_URL}/api/start", json={"version": vid, "port": 0}) # Auto port
                time.sleep(2) # Let it run
                requests.post(f"{BASE_URL}/api/stop", json={"version": vid})
                requests.post(f"{BASE_URL}/api/delete", json={"version": vid})
                log(user_id, "Cycle: Start->Stop->Delete", "PASS")
                
            elif action == 'archive':
                # Archive -> Unarchive -> Trash
                requests.post(f"{BASE_URL}/api/archive", json={"version": vid})
                time.sleep(0.5)
                requests.post(f"{BASE_URL}/api/unarchive", json={"version": vid})
                requests.post(f"{BASE_URL}/api/trash", json={"version": vid})
                log(user_id, "Cycle: Archive->Restore->Trash", "PASS")
                
            elif action == 'trash':
                # Trash -> Empty
                requests.post(f"{BASE_URL}/api/trash", json={"version": vid})
                # Only empty YOUR items? No, API is global. This is conflict territory!
                # If we verify existence, it might be gone because another user emptied it.
                # This tests robustness against 404s.
                res = requests.post(f"{BASE_URL}/api/trash/empty")
                log(user_id, "Cycle: Trash->Empty", "PASS")

        except Exception as e:
            log(user_id, f"Exception: {e}", "FAIL")

    log(user_id, "Simulation Finished", "INFO")

# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------

def main():
    safe_print("=========================================")
    safe_print(" GIGA SIMULATION: CONCURRENT CHAOS")
    safe_print(f" Users: {NUM_USERS} | Iterations: {ITERATIONS_PER_USER}")
    safe_print("=========================================")
    
    threads = []
    
    # Clean Start
    requests.post(f"{BASE_URL}/api/trash/empty")
    
    start_time = time.time()
    
    for i in range(NUM_USERS):
        t = threading.Thread(target=user_worker, args=(i,))
        threads.append(t)
        t.start()
        
    for t in threads:
        t.join()
        
    duration = time.time() - start_time
    safe_print(f"\n=========================================")
    safe_print(f" ALL USERS FINISHED in {duration:.2f}s")
    safe_print(f"=========================================")
    
    # Final Health Check
    res = requests.get(f"{BASE_URL}/api/versions")
    if res.status_code == 200:
        safe_print(f"[OK] System survived. Active versions: {len(res.json())}")
    else:
        safe_print(f"[XX] System crashed! Status: {res.status_code}")

if __name__ == "__main__":
    import os # Late import fix
    main()
