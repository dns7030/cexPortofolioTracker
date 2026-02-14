#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file manually
try {
  const envPath = join(__dirname, '.env');
  const envFile = readFileSync(envPath, 'utf8');

  envFile.split('\n').forEach(line => {
    line = line.trim();
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) return;

    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      process.env[key] = value;
    }
  });
} catch (error) {
  // Silently fail if .env doesn't exist
}

// Import and run the main index.original.js
await import('./index.original.js');
