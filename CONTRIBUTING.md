# Contributing to CEX Portfolio Tracker

Thank you for contributing! Here are the guidelines to ensure smooth development.

## Building Releases

### Creating a Release ZIP

**ALWAYS use the build script:**

```bash
python build-release.py
```

**NEVER use PowerShell Compress-Archive** - it creates backslashes that Claude.ai rejects!

### Why We Have a Build Script

- **PowerShell Issue**: `Compress-Archive` creates ZIP files with backslashes (`\`) in paths
- **Claude.ai Requirement**: ZIP files must use forward slashes (`/`) for upload compatibility
- **Our Solution**: `build-release.py` uses Python's zipfile module to create proper cross-platform ZIPs

## Code Guidelines

### Windows Compatibility

When writing Python scripts:

❌ **DO NOT use emojis** in print statements:
```python
print('🔨 Building...')  # WRONG - causes UnicodeEncodeError on Windows
```

✅ **DO use plain ASCII characters**:
```python
print('* Building...')  # CORRECT - works everywhere
```

**Why?** Windows cmd.exe uses cp1252 encoding which doesn't support Unicode emojis.

### File Encoding

- All Python scripts: **UTF-8**
- All JavaScript files: **UTF-8**
- Line endings: **LF** (not CRLF) for cross-platform compatibility

### Dependencies

This project follows a **zero dependencies** philosophy:

- ✅ Node.js built-in modules only (`crypto`, `fetch`, `fs`, `path`)
- ✅ Python standard library only (`os`, `zipfile`, `pathlib`)
- ❌ No npm packages
- ❌ No pip packages

### SKILL.md Frontmatter

The `SKILL.md` file has strict requirements for frontmatter properties:

✅ **ALLOWED properties:**
- `name` (required)
- `description` (required)
- `license`
- `allowed-tools`
- `compatibility`
- `metadata`

❌ **NOT ALLOWED:**
- `version` - causes "unexpected key" error
- Custom fields

**Correct example:**
```yaml
---
name: cex-balance
description: Check cryptocurrency exchange balances...
---
```

**Incorrect example (will fail):**
```yaml
---
name: cex-balance
description: Check cryptocurrency exchange balances...
version: 2.0.1  # ERROR: unexpected key
---
```

**Where to put version info:** In the markdown title or Support section, NOT in frontmatter.

## Testing

Before committing:

1. **Test the skill locally:**
   ```bash
   cd cex-balance
   cp env.example .env
   # Add test API keys (read-only!)
   node index.js
   ```

2. **Test the build script:**
   ```bash
   python build-release.py
   unzip -l cex-balance-skill.zip  # Verify forward slashes
   ```

3. **Verify ZIP paths:**
   - All paths should use `/` not `\`
   - Example: `cex-balance/lib/binance.js` ✅
   - Example: `cex-balance\lib\binance.js` ❌

## Security

### API Keys

- ✅ `.env` is in `.gitignore`
- ✅ Build script automatically excludes `.env` from ZIP
- ❌ **NEVER commit API keys**
- ❌ **NEVER include `.env` in releases**

### Read-Only APIs

- All API implementations must use **READ-ONLY** permissions
- Never implement trading, withdrawal, or transfer functions
- Verify exchange API calls only request balance data

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following these guidelines
4. Test locally (see Testing section above)
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Questions?

Open an issue: https://github.com/dns7030/cexPortofolioTracker/issues

---

**Remember**: No emojis in Python scripts, always use the build script for releases!
