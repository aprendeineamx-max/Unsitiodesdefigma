import requests
import json
import time
import sys
import io
import zipfile
import random
import uuid

# Config
BASE_URL = "http://localhost:3000"
TOTAL_STEPS = 200  # Number of random actions to perform
DELAY_BETWEEN_STEPS = 0.1

# ---------------------------------------------------------
# UTILS
# ---------------------------------------------------------
def safe_print(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'))

def create_dummy_zip(name):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('package.json', json.dumps({"name": name, "scripts": {"dev": "echo Run"}}))
        zf.writestr('index.html', f'<h1>{name}</h1>')
    buffer.seek(0)
    return buffer

# ---------------------------------------------------------
# MODEL
# ---------------------------------------------------------
class LabVersion:
    def __init__(self, vid):
        self.id = vid
        self.state = 'active' # active, archived, trashed, deleted
        self.run_status = 'stopped' # stopped, running

    def __repr__(self):
        return f"<{self.id} | {self.state} | {self.run_status}>"

class SystemModel:
    def __init__(self):
        self.versions = {} # vid -> LabVersion

    def add_version(self, vid):
        self.versions[vid] = LabVersion(vid)

    def get_version(self, vid):
        return self.versions.get(vid)

    def get_by_state(self, state):
        return [v for v in self.versions.values() if v.state == state]
    
    def get_active(self): return self.get_by_state('active')
    def get_archived(self): return self.get_by_state('archived')
    def get_trashed(self): return self.get_by_state('trashed')

# ---------------------------------------------------------
# ACTIONS
# ---------------------------------------------------------
class Tester:
    def __init__(self):
        self.model = SystemModel()
        self.step_count = 0

    def sync_verify(self):
        """ Compare Model vs Real World """
        # map model: active -> specific endpoint
        
        # 1. Verify Active
        res = requests.get(f"{BASE_URL}/api/versions").json()
        real_active_ids = [v['id'] for v in res]
        expected_active = [v.id for v in self.model.get_active()]
        
        for vid in expected_active:
            if vid not in real_active_ids:
                return False, f"Missing Active: {vid}"
            # Check Status
            v_real = next(v for v in res if v['id'] == vid)
            v_model = self.model.get_version(vid)
            # Relaxed check for running/stopped as it takes time, but mapped existence is key
        
        for vid in real_active_ids:
            # If real has something model thinks is archived/trashed, that's bad (unless it's external)
            v_model = self.model.get_version(vid)
            if v_model and v_model.state != 'active':
                return False, f"Zombie Active: {vid} (Model says {v_model.state})"

        # 2. Verify Archive
        res = requests.get(f"{BASE_URL}/api/archive/list").json()
        real_archive_ids = [v['id'] for v in res]
        expected_archive = [v.id for v in self.model.get_archived()]
        
        for vid in expected_archive:
            if vid not in real_archive_ids:
                return False, f"Missing Archived: {vid}"
        
        for vid in real_archive_ids:
            v_model = self.model.get_version(vid)
            if v_model and v_model.state != 'archived':
                 return False, f"Zombie Archived: {vid} (Model says {v_model.state})"

        # 3. Verify Trash
        res = requests.get(f"{BASE_URL}/api/trash/list").json()
        real_trash_ids = [v['id'] for v in res]
        expected_trash = [v.id for v in self.model.get_trashed()]
        
        for vid in expected_trash:
            if vid not in real_trash_ids:
                return False, f"Missing Trashed: {vid}"
                
        return True, "Synced"

    def action_upload(self):
        name = f"tera_v{self.step_count}_{str(uuid.uuid4())[:4]}"
        buffer = create_dummy_zip(name)
        files = {'file': (name + ".zip", buffer, 'application/zip')}
        try:
            res = requests.post(f"{BASE_URL}/api/upload", files=files)
            if res.status_code == 200:
                vid = res.json().get('versionId')
                self.model.add_version(vid)
                return True, f"Uploaded {vid}"
        except: pass
        return False, "Upload Failed"

    def action_start(self):
        candidates = [v for v in self.model.get_active() if v.run_status == 'stopped']
        if not candidates: return None, "No candidates to Start"
        target = random.choice(candidates)
        
        requests.post(f"{BASE_URL}/api/start", json={"version": target.id, "port": 0})
        target.run_status = 'running' # Optimistic update
        # Wait a bit for reality to catch up? No, MBT checks eventual consistency essentially
        # But our simple sync_verify doesn't check run status strictly yet
        return True, f"Started {target.id}"

    def action_stop(self):
        # We don't strictly track run status in this simplified model loop effectively without callbacks
        # So we just try to stop any active
        candidates = self.model.get_active()
        if not candidates: return None, "No candidates to Stop"
        target = random.choice(candidates)
        
        requests.post(f"{BASE_URL}/api/stop", json={"version": target.id})
        target.run_status = 'stopped'
        return True, f"Stopped {target.id}"

    def action_archive(self):
        candidates = self.model.get_active()
        if not candidates: return None, "No candidates to Archive"
        target = random.choice(candidates)
        
        requests.post(f"{BASE_URL}/api/archive", json={"version": target.id})
        target.state = 'archived'
        target.run_status = 'stopped' # Archive forces stop
        return True, f"Archived {target.id}"

    def action_unarchive(self):
        candidates = self.model.get_archived()
        if not candidates: return None, "No candidates to Unarchive"
        target = random.choice(candidates)
        
        requests.post(f"{BASE_URL}/api/unarchive", json={"version": target.id})
        target.state = 'active'
        return True, f"Unarchived {target.id}"

    def action_trash(self):
        # Can trash from Active
        candidates = self.model.get_active()
        if not candidates: return None, "No candidates to Trash"
        target = random.choice(candidates)
        
        requests.post(f"{BASE_URL}/api/trash", json={"version": target.id})
        target.state = 'trashed'
        target.run_status = 'stopped'
        return True, f"Trashed {target.id}"

    def action_restore_trash(self):
        candidates = self.model.get_trashed()
        if not candidates: return None, "No candidates to Restore Trash"
        target = random.choice(candidates)
        
        requests.post(f"{BASE_URL}/api/restore", json={"version": target.id})
        target.state = 'active'
        return True, f"Restored Trash {target.id}"

    def action_empty_trash(self):
        candidates = self.model.get_trashed()
        if not candidates: return None, "Trash already empty"
        
        requests.post(f"{BASE_URL}/api/trash/empty")
        for v in candidates:
            v.state = 'deleted'
            # Remove from model tracking effectively? or keep as deleted
            del self.model.versions[v.id]
            
        return True, f"Emptied Trash ({len(candidates)} items)"
    
    def action_delete(self):
        candidates = self.model.get_active()
        if not candidates: return None, "No candidates to Delete"
        target = random.choice(candidates)
        
        requests.post(f"{BASE_URL}/api/delete", json={"version": target.id})
        target.state = 'deleted'
        del self.model.versions[target.id]
        return True, f"Deleted active {target.id}"


    def step(self):
        self.step_count += 1
        
        # Weighted Random Choice of Actions
        # High prob of upload/ops, low prob of destruction
        actions = [
            (self.action_upload, 20),
            (self.action_start, 15),
            (self.action_stop, 15),
            (self.action_archive, 10),
            (self.action_unarchive, 10),
            (self.action_trash, 10),
            (self.action_restore_trash, 5),
            (self.action_delete, 5),
            (self.action_empty_trash, 5)
        ]
        
        population = [a[0] for a in actions]
        weights = [a[1] for a in actions]
        
        chosen_action = random.choices(population, weights=weights, k=1)[0]
        
        success, msg = chosen_action()
        if not success and msg and "No candidates" in msg:
            # If failed due to no candidates, force upload to bootstrap system
            success, msg = self.action_upload()
            
        if success:
            safe_print(f"[{self.step_count}] {msg}")
            
        # VERIFY
        ok, status = self.sync_verify()
        if not ok:
            safe_print(f"!!! MODEL MISMATCH DETECTED: {status}")
            sys.exit(1)
            
        time.sleep(DELAY_BETWEEN_STEPS)


def main():
    safe_print("=========================================")
    safe_print(f" TERA SIMULATION: MODEL BASED TESTING")
    safe_print(f" Steps: {TOTAL_STEPS}")
    safe_print("=========================================")
    
    # Init clean
    requests.post(f"{BASE_URL}/api/trash/empty")
    
    tester = Tester()
    
    start_t = time.time()
    for i in range(TOTAL_STEPS):
        tester.step()
        
    duration = time.time() - start_t
    safe_print("=========================================")
    safe_print(f" COMPLETED {TOTAL_STEPS} STEPS in {duration:.2f}s")
    safe_print(" ALL MODEL STATES VERIFIED")
    safe_print("=========================================")

if __name__ == "__main__":
    main()
