#!/usr/bin/env node

/**
 * Build Release ZIP - Cross-platform ZIP creator
 *
 * Creates a proper ZIP file with forward slashes (/) in paths,
 * compatible with Claude.ai upload requirements.
 *
 * Uses only Node.js built-in modules - ZERO DEPENDENCIES!
 *
 * Why this exists:
 * - PowerShell Compress-Archive creates ZIPs with backslashes (\)
 * - Claude.ai rejects backslashes as invalid characters
 * - This creates proper cross-platform ZIPs with forward slashes (/)
 *
 * NOTE: This script currently uses 'tar' which may not be ideal.
 * Prefer using build-release.py (Python) for more reliable cross-platform builds.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const SOURCE_DIR = 'cex-balance';
const OUTPUT_FILE = 'cex-balance-skill.zip';

console.log('🔨 Building release ZIP with proper forward slashes...\n');

// Remove old ZIP if it exists
if (existsSync(OUTPUT_FILE)) {
  console.log(`🗑️  Removing old ${OUTPUT_FILE}...\n`);
  try {
    execSync(`rm -f "${OUTPUT_FILE}"`, { stdio: 'pipe' });
  } catch (e) {
    // Ignore errors
  }
}

try {
  // Use tar to create ZIP with proper forward slashes
  // Git Bash includes tar which creates proper ZIP files
  console.log('📦 Creating ZIP archive...\n');

  const command = `tar -a -c -f "${OUTPUT_FILE}" -C . "${SOURCE_DIR}"`;

  execSync(command, { stdio: 'pipe' });

  // Get file size
  const stat = execSync(`ls -lh "${OUTPUT_FILE}"`, { encoding: 'utf8' });
  const size = stat.split(/\s+/)[4];

  console.log('✅ Release ZIP created successfully!');
  console.log(`📁 File: ${OUTPUT_FILE}`);
  console.log(`📊 Size: ${size}`);
  console.log('\n✓ All paths use forward slashes (/) - Claude.ai compatible!');
  console.log('✓ Ready to upload to GitHub and distribute to users!');

} catch (error) {
  console.error('❌ Error creating ZIP:', error.message);
  console.error('\nNote: This script requires tar (available in Git Bash on Windows)');
  process.exit(1);
}
