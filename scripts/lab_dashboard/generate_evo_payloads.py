import json

# Clone
payload_clone = {
    "sourceVersion": "vv_atom", 
    "targetVersion": "vv_evo_1",
    "includeDeps": True
}
with open('payload_evo_clone.json', 'w') as f:
    json.dump(payload_clone, f)

# Start Evo (Port 8002)
payload_start_evo = {
    "version": "vv_evo_1",
    "port": 8002
}
with open('payload_evo_start.json', 'w') as f:
    json.dump(payload_start_evo, f)

# Stop Evo
payload_stop_evo = {
    "version": "vv_evo_1"
}
with open('payload_evo_stop.json', 'w') as f:
    json.dump(payload_stop_evo, f)

# Delete Evo
payload_delete_evo = {
    "version": "vv_evo_1"
}
with open('payload_evo_delete.json', 'w') as f:
    json.dump(payload_delete_evo, f)
