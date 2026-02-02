# CEX Balance Skill - Zero Installation Guide

##  ZERO INSTALLATION REQUIRED!

No npm install. No dependencies. No build step. Just download and run!

## Quick Start

### 1. Extract Archive
```bash
# You've already extracted this if you're reading this file!
```

### 2. Configure API Keys
```bash
cp env.example .env
# Edit .env with your READ-ONLY exchange API keys
```

### 3. Run Immediately
```bash
node index.js
```

**That's it!** The skill works immediately with no installation.

## Requirements

- **Node.js 18+** (for native fetch support)
- **Exchange API keys** (READ-ONLY permissions only!)

No npm, no packages, no node_modules needed.

## Usage

```bash
node index.js              # Show all balances
node index.js --summary    # Summary only
node index.js binance      # Single exchange
```

## Creating READ-ONLY API Keys

### Binance
1. Visit https://www.binance.com/en/my/settings/api-management
2. Create new API key
3. [YES] Enable ONLY "Read" permission
4. [NO] Disable ALL other permissions

### KuCoin
1. Visit https://www.kucoin.com/account/api
2. Create new API key
3. [YES] Enable ONLY "General" (read-only)

### Gate.io
1. Visit https://www.gate.io/myaccount/api_key_manage
2. Create new APIv4 key
3. [YES] Enable ONLY read permissions

## Files

```
cex-balance/
├── index.js          # Main entry point (4KB)
├── lib/
│   ├── binance.js    # Binance API client (5KB)
│   ├── kucoin.js     # KuCoin API client (5KB)
│   ├── gateio.js     # Gate.io API client (5KB)
│   └── exchanges.js  # Orchestration (6KB)
├── .env              # Your API keys (you create this)
├── env.example       # Template for .env
└── SKILL.md          # Skill manifest
```

Total: ~25KB of pure JavaScript

## Why No Installation?

This skill uses ONLY Node.js built-in modules:
- `crypto` - for HMAC-SHA256 API signing
- `fetch()` - for HTTP requests
- `process.env` - for configuration

No external libraries = no installation needed!

## Security

- API keys stored in local `.env` file only
- Only READ-ONLY permissions required
- No cloud services, no remote servers
- All code visible and auditable

## Troubleshooting

**"No exchanges configured"**
- Make sure `.env` exists with valid API keys

**"fetch is not defined"**
- Upgrade to Node.js 18+ (fetch is built-in)

## Support

- Repository: https://github.com/dns7030/cexPortofolioTracker/tree/skill
- Issues: https://github.com/dns7030/cexPortofolioTracker/issues
