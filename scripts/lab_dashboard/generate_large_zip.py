
import zipfile
import os

def create_large_zip(filename, size_mb):
    print(f"Generating {filename} ({size_mb} MB)...")
    content = b"0" * 1024 * 1024 # 1MB chunks
    with zipfile.ZipFile(filename, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Avoid creating one huge file entry, create 50 1MB entries
        # to stress test extraction quantity too
        for i in range(size_mb):
             zf.writestr(f"data_{i}.bin", content)
    print("Done.")

create_large_zip('large_valid.zip', 50) # 50MB
