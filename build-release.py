#!/usr/bin/env python3
"""
Build Release ZIP - Cross-platform ZIP creator

Creates a proper ZIP file with forward slashes (/) in paths,
compatible with Claude.ai upload requirements.

Why this exists:
- PowerShell Compress-Archive creates ZIPs with backslashes
- Claude.ai rejects backslashes as invalid characters
- This creates proper cross-platform ZIPs with forward slashes (/)

Uses only Python standard library - zero dependencies!

IMPORTANT: NO EMOJIS IN THIS FILE!
- Windows cmd.exe uses cp1252 encoding which doesn't support emojis
- Emojis will cause UnicodeEncodeError on Windows
- Use plain ASCII characters only (*, +, -, etc.)
"""

import os
import zipfile
from pathlib import Path

SOURCE_DIR = 'cex-balance'
OUTPUT_FILE = 'cex-balance-skill.zip'

print('Building release ZIP with proper forward slashes...\n')

# Remove old ZIP if it exists
if os.path.exists(OUTPUT_FILE):
    print(f'*  Removing old {OUTPUT_FILE}...\n')
    os.remove(OUTPUT_FILE)

print('* Creating ZIP archive...\n')

# Create ZIP file
with zipfile.ZipFile(OUTPUT_FILE, 'w', zipfile.ZIP_DEFLATED) as zipf:
    source_path = Path(SOURCE_DIR)

    for file_path in source_path.rglob('*'):
        if file_path.is_file():
            # Skip .env file for security
            if file_path.name == '.env':
                continue

            # Get relative path from source directory (NOT parent!)
            # This ensures files are at ZIP root, not nested in a folder
            relative_path = file_path.relative_to(source_path)

            # Convert to forward slashes (POSIX style)
            # This is CRITICAL for Claude.ai compatibility
            archive_name = relative_path.as_posix()

            print(f'  + {archive_name}')
            zipf.write(file_path, archive_name)

# Get file size
file_size = os.path.getsize(OUTPUT_FILE)
size_kb = file_size / 1024

print(f'\nSUCCESS: Release ZIP created successfully!')
print(f'File: File: {OUTPUT_FILE}')
print(f'Size: Size: {size_kb:.2f} KB ({file_size} bytes)')
print(f'\n+ All paths use forward slashes (/) - Claude.ai compatible!')
print(f'+ Ready to upload to GitHub and distribute to users!')
