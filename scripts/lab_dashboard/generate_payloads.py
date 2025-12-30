import json

payload_stop = {"versionId": "vv_atom"}
with open('payload_stop.json', 'w') as f:
    json.dump(payload_stop, f)

payload_start = {"versionId": "vv_atom", "port": 8001}
with open('payload_start.json', 'w') as f:
    json.dump(payload_start, f)
