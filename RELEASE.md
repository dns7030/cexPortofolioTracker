# CEX Balance Skill - Release Package

## Downloads

Two archive formats available:

- **`cex-balance-skill.zip`** (13 KB) - For Windows users
- **`cex-balance-skill.tar.gz`** (9.5 KB) - For macOS/Linux users

## What's Included

```
cex-balance/
├── index.js              # Main skill entry point
├── lib/
│   └── exchanges.js      # Exchange integration logic
├── skill.json            # Skill manifest
├── SKILL.md              # SkillsMP format documentation
├── package.json          # NPM dependencies (only ccxt)
├── package-lock.json     # Locked dependencies
├── .env.example          # Example environment configuration
├── README.md             # Full documentation
├── LICENSE               # MIT License with crypto disclaimer
└── INSTALL.md            # Installation guide
```

## Quick Start

### 1. Extract Archive

**Windows:**
```powershell
# Extract to Claude Code skills directory
Expand-Archive -Path cex-balance-skill.zip -DestinationPath $env:USERPROFILE\.claude\skills\
```

**macOS/Linux:**
```bash
# Extract to Claude Code skills directory
tar -xzf cex-balance-skill.tar.gz -C ~/.claude/skills/
```

### 2. Install Dependencies

```bash
cd ~/.claude/skills/cex-balance
npm install
```

### 3. Configure API Keys

```bash
cp .env.example .env
# Edit .env with your READ-ONLY exchange API keys
```

### 4. Test

```bash
npm start
```

## Usage in Claude Code

```
/cex-balance              # Check all configured exchanges
/cex-balance binance      # Check only Binance
/cex-balance kucoin       # Check only KuCoin
/cex-balance gateio       # Check only Gate.io
/cex-balance --summary    # Show portfolio summary
```

## Requirements

- **Node.js:** 18+ (for ES Modules support)
- **NPM:** Comes with Node.js
- **Exchange Accounts:** Binance, KuCoin, and/or Gate.io
- **API Keys:** READ-ONLY permissions only!

## Security Warning

⚠️ **CRITICAL:**
- This skill stores API keys locally in a `.env` file
- Only use READ-ONLY API keys (no trading/withdrawal permissions)
- You are fully responsible for securing your API keys
- The authors take NO RESPONSIBILITY for any losses
- USE AT YOUR OWN RISK

## Features

✅ Check balances from multiple exchanges in one command
✅ View both Spot and Earn/Savings accounts
✅ Real-time USD pricing via USDT trading pairs
✅ Markdown-formatted output for easy reading
✅ Pure JavaScript - no build step required!
✅ Only 1 dependency: CCXT

## Technical Details

- **Language:** Pure JavaScript (ES Modules)
- **Dependencies:** CCXT only (cryptocurrency exchange library)
- **Runtime:** Node.js 18+
- **Size:** ~13 KB (ZIP), ~9.5 KB (tar.gz)
- **Installation:** Extract + npm install + configure
- **Execution:** Direct (no compilation/build step)

## Support

- **Repository:** https://github.com/dns7030/cexPortofolioTracker/tree/skill
- **Issues:** https://github.com/dns7030/cexPortofolioTracker/issues
- **License:** MIT

## Version

**v1.0.0** - Initial release
- Pure JavaScript implementation
- Support for Binance, KuCoin, Gate.io
- Spot and Earn/Savings account types
- No build step required

---

**Disclaimer:** This software is provided "AS IS" without warranty. Use at your own risk. The authors are not responsible for any financial losses or security breaches.
