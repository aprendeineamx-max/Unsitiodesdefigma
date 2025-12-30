import requests
import json
import time
import sys
import os
import zipfile
import io
import concurrent.futures

# Config
BASE_URL = "http://localhost:3000"
UNICODE_CHECK = "✅"

# Windows Console Safety
def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'))

def step(name):
    safe_print(f"\n>>> [STEP] {name}")

def log(msg, status="INFO"):
    icon = "OK" if status == "PASS" else "XX" if status == "FAIL" else "--"
    safe_print(f"[{icon}] {msg}")

# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def create_zip_in_memory(name_inside_json):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('package.json', json.dumps({"name": name_inside_json, "scripts": {"dev": "echo Running"}}))
        zf.writestr('index.html', f'<h1>{name_inside_json}</h1>')
    buffer.seek(0)
    return buffer

def upload_zip(filename):
    """
    Uploads a zip and returns the server-assigned versionId
    """
    buffer = create_zip_in_memory(filename)
    files = {'file': (filename, buffer, 'application/zip')}
    
    try:
        res = requests.post(f"{BASE_URL}/api/upload", files=files)
        if res.status_code == 200:
            data = res.json()
            vid = data.get('versionId')
            log(f"Uploaded {filename} -> ID: {vid}", "PASS")
            return vid
        else:
            log(f"Upload failed for {filename}: {res.text}", "FAIL")
            return None
    except Exception as e:
        log(f"Exception uploading {filename}: {e}", "FAIL")
        return None

def verify_in_dashboard(vid, should_exist=True):
    res = requests.get(f"{BASE_URL}/api/versions").json()
    found = any(v['id'] == vid for v in res)
    if found == should_exist:
        return True
    return False

def verify_in_archive(vid, should_exist=True):
    res = requests.get(f"{BASE_URL}/api/archive/list").json()
    found = any(v['id'] == vid for v in res)
    if found == should_exist:
        return True
    return False

def verify_in_trash(vid, should_exist=True):
    res = requests.get(f"{BASE_URL}/api/trash/list").json()
    found = any(v['id'] == vid for v in res)
    if found == should_exist:
        return True
    return False

def wait_for_status(vid, target_status, timeout=10):
    for _ in range(timeout):
        res = requests.get(f"{BASE_URL}/api/versions").json()
        target = next((v for v in res if v['id'] == vid), None)
        if target and target.get('status') == target_status:
            return True
        time.sleep(1)
    return False

# ---------------------------------------------------------
# SCENARIOS
# ---------------------------------------------------------

def scenario_solo_hero():
    step("SCENARIO 1: The Solo Hero (Full Lifecycle)")
    
    filename = "hero_v1.zip"
    vid = upload_zip(filename)
    if not vid: return False
    
    # 1. Start on specific port
    target_port = 5500
    log(f"Starting {vid} on port {target_port}...", "INFO")
    requests.post(f"{BASE_URL}/api/start", json={"version": vid, "port": target_port})
    
    if wait_for_status(vid, 'running', 15):
        # Verify port
        res = requests.get(f"{BASE_URL}/api/versions").json()
        v_data = next((v for v in res if v['id'] == vid), None)
        if v_data and v_data.get('port') == target_port:
            log(f"Running correctly on port {target_port}", "PASS")
        else:
            log(f"Running but wrong port: {v_data.get('port')}", "FAIL")
    else:
        log("Failed to start", "FAIL")
        return False

    # 2. Stop
    log(f"Stopping {vid}...", "INFO")
    requests.post(f"{BASE_URL}/api/stop", json={"version": vid})
    if wait_for_status(vid, 'stopped'):
        log("Stopped successfully", "PASS")
    else:
        log("Stop failed", "FAIL")
        return False

    # 3. Direct Delete (Permanent)
    # First, let's re-upload a temp one to delete, to save our hero for Archive testing
    # Actually, let's use a sidekick for delete
    
    return vid # Return hero for next phases

def scenario_sidekick_sacrifice():
    step("SCENARIO 2: The Sidekick Sacrifice (Direct Delete)")
    vid = upload_zip("sidekick.zip")
    if not vid: return False
    
    log(f"Deleting {vid} permanently...", "INFO")
    requests.post(f"{BASE_URL}/api/delete", json={"version": vid})
    
    time.sleep(1)
    if verify_in_dashboard(vid, False):
        log("Sidekick deleted permanently", "PASS")
        return True
    else:
        log("Sidekick still in dashboard!", "FAIL")
        return verify_in_trash(vid, False) # Should NOT be in trash either

def scenario_archive_master(hero_id):
    step("SCENARIO 3: The Archive Master")
    
    log(f"Archiving {hero_id}...", "INFO")
    requests.post(f"{BASE_URL}/api/archive", json={"version": hero_id})
    
    time.sleep(0.5)
    if verify_in_dashboard(hero_id, False) and verify_in_archive(hero_id, True):
        log("Moved to Archive correctly", "PASS")
    else:
        log("Archive move failed", "FAIL")
        return False
        
    log(f"Restoring {hero_id}...", "INFO")
    requests.post(f"{BASE_URL}/api/unarchive", json={"version": hero_id})
    
    time.sleep(0.5)
    if verify_in_dashboard(hero_id, True) and verify_in_archive(hero_id, False):
        log("Restored from Archive correctly", "PASS")
        return True
    else:
        log("Restore failed", "FAIL")
        return False

def scenario_batch_squad():
    step("SCENARIO 4: The Batch Squad (Bulk Operations)")
    
    squad = ["squad_alpha.zip", "squad_beta.zip", "squad_gamma.zip"]
    ids = []
    
    # Bulk Upload
    for name in squad:
        vid = upload_zip(name)
        if vid: ids.append(vid)
        
    if len(ids) != 3:
        log("Failed to upload entire squad", "FAIL")
        return False
        
    log(f"Squad assembled: {ids}", "INFO")
    
    # Batch Archive (Frontend simulation: loop requests)
    log("Batch Archiving...", "INFO")
    for vid in ids:
        requests.post(f"{BASE_URL}/api/archive", json={"version": vid})
        
    time.sleep(1)
    
    # Verify all in Verify
    all_archived = all(verify_in_archive(vid, True) for vid in ids)
    all_gone_dash = all(verify_in_dashboard(vid, False) for vid in ids)
    
    if all_archived and all_gone_dash:
        log("Batch Archive Successful", "PASS")
    else:
        log("Batch Archive Failed", "FAIL")
        return False
        
    # Batch Restore
    log("Batch Restoring...", "INFO")
    for vid in ids:
        requests.post(f"{BASE_URL}/api/unarchive", json={"version": vid})
        
    time.sleep(1)
    if all(verify_in_dashboard(vid, True) for vid in ids):
        log("Batch Restore Successful", "PASS")
    else:
        log("Batch Restore Failed", "FAIL")
        return False
        
    return ids

def scenario_trash_disaster(squad_ids):
    step("SCENARIO 5: The Trash Disaster (Batch Trash & Empty)")
    
    # Batch Trash
    log("Trashing everything...", "INFO")
    for vid in squad_ids:
        requests.post(f"{BASE_URL}/api/trash", json={"version": vid})
        
    time.sleep(1)
    if all(verify_in_trash(vid, True) for vid in squad_ids):
        log("All items in Trash", "PASS")
    else:
        log("Some items missed Trash", "FAIL")
        return False
        
    # Empty Trash
    log("Emptying Trash...", "INFO")
    requests.post(f"{BASE_URL}/api/trash/empty")
    
    time.sleep(1)
    # Verify Trash Empty
    res = requests.get(f"{BASE_URL}/api/trash/list").json()
    if len(res) == 0:
        log("Trash is completely empty", "PASS")
        return True
    else:
        log(f"Trash not empty: {len(res)} items remain", "FAIL")
        return False

def scenario_port_conflict():
    step("SCENARIO 6: The Port Conflict (Smart Port)")
    
    v1 = upload_zip("conflict_a.zip")
    v2 = upload_zip("conflict_b.zip")
    
    preferred_port = 7000
    
    # Start A
    requests.post(f"{BASE_URL}/api/start", json={"version": v1, "port": preferred_port})
    wait_for_status(v1, 'running')
    
    # Start B on SAME port
    log(f"Attempting to start {v2} on BUSY port {preferred_port}...", "INFO")
    requests.post(f"{BASE_URL}/api/start", json={"version": v2, "port": preferred_port})
    wait_for_status(v2, 'running')
    
    # Check results
    res = requests.get(f"{BASE_URL}/api/versions").json()
    
    v1_data = next(v for v in res if v['id'] == v1)
    v2_data = next(v for v in res if v['id'] == v2)
    
    log(f"{v1} Port: {v1_data.get('port')}", "INFO")
    log(f"{v2} Port: {v2_data.get('port')}", "INFO")
    
    if v1_data.get('port') == preferred_port and v2_data.get('port') != preferred_port and v2_data.get('port') is not None:
        log("Smart Port Logic worked! Second app moved to available port.", "PASS")
    elif v1_data.get('port') == v2_data.get('port'):
        log("CRITICAL: Port Collision! Both think they are on same port!", "FAIL")
        return False
    else:
        log("Unexpected port assignment", "FAIL")
        return False
        
    # Cleanup
    requests.post(f"{BASE_URL}/api/stop", json={"version": v1})
    requests.post(f"{BASE_URL}/api/stop", json={"version": v2})
    requests.post(f"{BASE_URL}/api/delete", json={"version": v1})
    requests.post(f"{BASE_URL}/api/delete", json={"version": v2})
    return True

# ---------------------------------------------------------
# EXECUTION
# ---------------------------------------------------------

def main():
    safe_print("==================================================")
    safe_print(" ULTIMATE USER SIMULATION - HUMAN ACTIONS SUITE")
    safe_print("==================================================")
    
    # Cleanup before start
    safe_print("Cleaning up previous runs...")
    requests.post(f"{BASE_URL}/api/trash/empty") 
    # (Checking dashboard to delete leftovers would be nice but risky if user has real work)
    # We will just proceed.
    
    hero_id = scenario_solo_hero()
    if not hero_id: 
        safe_print("❌ Aborting: Hero died.")
        sys.exit(1)
        
    if not scenario_sidekick_sacrifice(): sys.exit(1)
    if not scenario_archive_master(hero_id): sys.exit(1)
    
    squad_ids = scenario_batch_squad()
    if not squad_ids: sys.exit(1)
    
    # Add hero to squad for final disposal
    squad_ids.append(hero_id)
    
    if not scenario_trash_disaster(squad_ids): sys.exit(1)
    
    if not scenario_port_conflict(): sys.exit(1)
    
    safe_print("\n🏆 ULTIMATE VICTORY: The system handled ALL human simulations.")

if __name__ == "__main__":
    main()
