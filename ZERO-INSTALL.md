# 🚀 ZERO-INSTALLATION CEX Balance Skill

## What Makes This Special?

**NO npm install. NO dependencies. NO build step. Just download and run!**

This skill uses ONLY Node.js built-in modules:
- ✅ `crypto` - for HMAC-SHA256 API signing
- ✅ `fetch()` - for HTTP requests (Node 18+)
- ✅ `process.env` - for configuration

**Total size: ~25KB** (vs 4.5MB with CCXT library)

## Installation

### Option 1: Download Archive
```bash
# Download from GitHub
# Extract to ~/.claude/skills/cex-balance

# Configure API keys
cd ~/.claude/skills/cex-balance
cp .env.example .env
# Edit .env with your keys

# RUN IMMEDIATELY!
node index.js
```

### Option 2: Git Clone
```bash
git clone https://github.com/dns7030/cexPortofolioTracker.git cex-balance
cd cex-balance
git checkout skill

cp .env.example .env
# Edit .env

node index.js
```

## That's It!

No npm install.
No package.json.
No node_modules folder.
No build process.
No waiting.

Just pure JavaScript that runs immediately.

## How It Works

Instead of using the 4.5MB CCXT library, we implement exchange APIs directly using Node.js built-ins:

**Binance Example:**
```javascript
import crypto from 'crypto';

function signRequest(queryString, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(queryString)
    .digest('hex');
}

const response = await fetch(
  `https://api.binance.com/api/v3/account?${query}&signature=${sig}`,
  { headers: { 'X-MBX-APIKEY': apiKey } }
);
```

## Requirements

- **Node.js 18+** (for native fetch support)
- **Exchange API keys** (READ-ONLY permissions!)

## Supported Exchanges

All with Spot + Earn/Savings support:
- ✅ Binance
- ✅ KuCoin
- ✅ Gate.io

## Files

```
25KB total:
├── index.js (4KB) - Main entry point
└── lib/
    ├── binance.js (5KB) - Binance API client
    ├── kucoin.js (5KB) - KuCoin API client
    ├── gateio.js (5KB) - Gate.io API client
    └── exchanges.js (6KB) - Orchestration
```

## Comparison

**With CCXT (before):**
```bash
npm install    # Downloads 4.5MB
npm start      # Runs skill
```

**Zero-Install (now):**
```bash
node index.js  # Just works!
```

## Trade-offs

**Pros:**
- ⚡ Instant startup (no library loading)
- 📦 Tiny footprint (25KB vs 4.5MB)
- 🔍 Transparent code (can see all API calls)
- 🚀 Zero friction installation

**Cons:**
- 📝 More code to maintain (~450 lines vs 1 import)
- 🔧 Manual API updates (vs CCXT auto-updates)
- 📊 Only 3 exchanges (vs CCXT's 100+)

For a focused skill, the trade-off is worth it!

## Security

Same security model:
- API keys stored in local `.env` file
- Only READ-ONLY permissions required
- No external dependencies to trust
- All code visible and auditable

## License

MIT - See LICENSE file
