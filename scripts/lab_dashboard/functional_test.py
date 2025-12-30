#!/usr/bin/env python3
"""
FUNCTIONAL USER JOURNEY TESTER
==============================
Verifies complete user flows instead of isolated endpoints.
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:3000"

def log(msg, status="INFO"):
    icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "ℹ️"
    print(f"{icon} [{status}] {msg}")

def test_lifecycle_flow():
    print("\n📦 TEST: LIFECYCLE FLOW (Active -> Archive -> Active)")
    
    # 1. Identify a test victim (first available version)
    try:
        res = requests.get(f"{BASE_URL}/api/versions")
        versions = res.json()
        if not versions:
            log("No versions found to test", "FAIL")
            return False
            
        # Pick one that is strictly 'lab' type if possible
        victim = next((v for v in versions if v['type'] == 'lab'), versions[0])
        vid = victim['id']
        log(f"Selected victim: {vid}", "INFO")
        
        # 2. Archive it
        log(f"Archiving {vid}...", "INFO")
        res = requests.post(f"{BASE_URL}/api/archive", json={"version": vid})
        if res.status_code != 200:
            log(f"Failed to archive: {res.text}", "FAIL")
            return False
            
        # 3. Verify it's gone from Dashboard
        time.sleep(1)
        versions = requests.get(f"{BASE_URL}/api/versions").json()
        if any(v['id'] == vid for v in versions):
            log(f"{vid} still visible in Dashboard after archive", "FAIL")
            return False
        else:
            log(f"{vid} removed from Dashboard", "PASS")
            
        # 4. Verify it's in Archive List
        archives = requests.get(f"{BASE_URL}/api/archive/list").json()
        if not any(a['id'] == vid for a in archives):
            log(f"{vid} NOT found in Archive List", "FAIL")
            return False
        else:
            log(f"{vid} confirmed in Archive List", "PASS")
            
        # 5. Restore (Unarchive)
        log(f"Unarchiving {vid}...", "INFO")
        res = requests.post(f"{BASE_URL}/api/unarchive", json={"version": vid})
        if res.status_code != 200:
            log(f"Failed to unarchive: {res.text}", "FAIL")
            return False
            
        # 6. Verify it's back in Dashboard
        time.sleep(1)
        versions = requests.get(f"{BASE_URL}/api/versions").json()
        if any(v['id'] == vid for v in versions):
            log(f"{vid} successfully restored to Dashboard", "PASS")
            return True
        else:
            log(f"{vid} did NOT reappear in Dashboard", "FAIL")
            return False
            
    except Exception as e:
        log(f"Exception: {e}", "FAIL")
        return False

def test_trash_flow():
    print("\n🗑️ TEST: TRASH FLOW (Active -> Trash -> Active)")
    
    # 1. Start setup
    res = requests.get(f"{BASE_URL}/api/versions")
    versions = res.json()
    if not versions: return False
    
    victim = next((v for v in versions if v['type'] == 'lab'), versions[0])
    vid = victim['id']
    
    # 2. Trash it
    log(f"Trashing {vid}...", "INFO")
    requests.post(f"{BASE_URL}/api/trash", json={"version": vid})
    
    # 3. Verify in Trash List
    time.sleep(1)
    trash_items = requests.get(f"{BASE_URL}/api/trash/list").json()
    if not any(t['id'] == vid for t in trash_items):
        log(f"{vid} NOT found in Trash List", "FAIL")
        return False
    else:
        log(f"{vid} confirmed in Trash List", "PASS")
        
    # 4. Restore
    log(f"Restoring {vid}...", "INFO")
    requests.post(f"{BASE_URL}/api/restore", json={"version": vid})
    
    # 5. Verify back
    time.sleep(1)
    versions = requests.get(f"{BASE_URL}/api/versions").json()
    if any(v['id'] == vid for v in versions):
        log(f"{vid} restored from Trash", "PASS")
        return True
    else:
        log(f"{vid} failed to restore from Trash", "FAIL")
        return False

if __name__ == "__main__":
    success_life = test_lifecycle_flow()
    success_trash = test_trash_flow()
    
    if success_life and success_trash:
        print("\n🏆 ALL USER JOURNEYS PASSED")
        sys.exit(0)
    else:
        print("\n💥 ONE OR MORE JOURNEYS FAILED")
        sys.exit(1)
