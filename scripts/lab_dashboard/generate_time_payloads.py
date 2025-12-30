import json

payload = {"STRICT_CHECK": "Passed", "RANDOM": "8844"}
with open('payload_env_strict.json', 'w') as f:
    json.dump(payload, f)

payload_snap = {"name": "snap_time_origin"}
with open('payload_snap.json', 'w') as f:
    json.dump(payload_snap, f)

payload_restore = {"snapshotId": "snap_time_origin"}
with open('payload_restore.json', 'w') as f:
    json.dump(payload_restore, f)
