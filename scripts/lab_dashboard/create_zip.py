import os
import json
import zipfile

os.makedirs('temp_atom_source', exist_ok=True)

pkg = {"name": "v_atom", "version": "1.0.0"}
with open('temp_atom_source/package.json', 'w') as f:
    json.dump(pkg, f)

with open('temp_atom_source/index.html', 'w') as f:
    f.write('<h1>Hello Atom</h1>')

with zipfile.ZipFile('v_atom.zip', 'w') as z:
    z.write('temp_atom_source/package.json', 'package.json')
    z.write('temp_atom_source/index.html', 'index.html')

print("v_atom.zip created successfully")
