# CEX Portfolio Tracker - Claude Code Skill

A Claude Code skill for checking cryptocurrency exchange balances across 7 major exchanges.

## Private web dashboard (Railway)

This repository also contains a small password-protected web dashboard for **Binance, Gate, and KuCoin**. It runs on Node.js 20+, uses the exchange clients in `cex-balance/lib`, and stores no balance history. Exchange requests happen on the server when the page loads or Refresh is clicked. API credentials are never sent to the browser.

### Deploy

1. Create a Railway service from this repository. Use the repository root as the service root. Railway can run `npm start`; set the start command to `npm start` if needed.
2. In **Service → Variables**, add the names shown in [`railway.env.example`](railway.env.example). Set a unique `DASHBOARD_PASSWORD` (at least 6 characters) and a random `SESSION_SECRET` (at least 32 characters). You can generate the latter locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
3. Add only the read-only exchange keys you use. For KuCoin, set `KUCOIN_API_KEY_VERSION` to the version shown on its API Management page. Missing exchanges appear as “Not connected.” Do not commit a filled environment file.
4. Deploy, then use **Settings → Networking → Generate Domain**. Open the HTTPS domain and sign in with `DASHBOARD_PASSWORD`.

To run locally, set `DASHBOARD_PASSWORD` and `SESSION_SECRET` in your shell, then run `npm start` and open `http://localhost:3000`. Run `npm test` for the server checks. The dashboard does not read `cex-balance/.env`; Railway variables are used at runtime.

The dashboard currently shows Binance Spot and Simple Earn, Gate Spot and Uni lending, and KuCoin Spot, Funding, and Earn holdings. It does not include margin, futures, subaccounts, or every exchange savings product. USD estimates use available USDT pairs; an asset without a matching price is shown with a $0 estimate. An exchange API error may reflect key permissions, region restrictions, or exchange availability.

Use dedicated read-only keys. Without Railway static outbound IPs, leave exchange IP allowlists off only if you accept that tradeoff and the exchange permits it. Railway's static outbound IP option can be added later without changing the app.

## Supported Exchanges

1. **Binance** - World's largest exchange
2. **Coinbase** - Major US exchange
3. **OKX** - Top global exchange
4. **Bybit** - Derivatives and spot
5. **Bitget** - Fast-growing exchange
6. **Gate.io** - Wide coin selection
7. **KuCoin** - Altcoin powerhouse

**[WARNING] Geo-Restrictions:** Some exchanges (Binance, KuCoin, Bybit) block API access from US and other restricted regions. If you see API errors mentioning restricted locations, you'll need to use a VPN with a non-restricted IP address to access these exchanges.

## Quick Install

Download and install the skill:

1. **Download**: [`cex-balance-skill.zip`](cex-balance-skill.zip) (19 KB)

2. **Extract to skills directory**:
   ```bash
   # Windows
   Expand-Archive -Path cex-balance-skill.zip -DestinationPath $env:USERPROFILE\.claude\skills\cex-balance

   # macOS/Linux
   unzip cex-balance-skill.zip -d ~/.claude/skills/cex-balance
   ```

3. **Configure API keys**:
   ```bash
   cd ~/.claude/skills/cex-balance
   cp env.example .env
   # Edit .env with your READ-ONLY exchange API keys
   ```

4. **Restart Claude Code**

5. **Use the skill**:
   ```
   /cex-balance
   ```

## Features

- [YES] Check balances from multiple exchanges in one command
- [YES] View both Spot and Earn/Savings accounts
- [YES] Real-time USD pricing via USDT trading pairs
- [YES] Zero dependencies - pure JavaScript
- [YES] 19 KB total size
- [YES] Supports 7 major exchanges
- [YES] No npm install required

## Security

- [WARNING] Only use READ-ONLY API keys
- [WARNING] API keys stored locally in `.env` file
- [WARNING] You are fully responsible for your API key security
- [NO] Never enable trading/withdrawal permissions

## Repository Structure

```
cexPortofolioTracker/
├── cex-balance/                      # The skill source code
│   ├── lib/                          # Exchange API clients
│   ├── index.js                      # Main entry point
│   ├── SKILL.md                      # Skill manifest
│   ├── README.md                     # Full documentation
│   └── env.example                   # API key template
├── cex-balance-skill.zip             # Ready-to-install package (19 KB)
└── CLAUDE.md                         # Project instructions for Claude Code

```

## Exchange Features

| Exchange | Spot Balance | Earn/Savings | Notes |
|----------|--------------|--------------|-------|
| Binance | ✓ | ✓ | World's largest |
| Coinbase | ✓ | - | US-based |
| OKX | ✓ | ✓ | Full-featured |
| Bybit | ✓ | - | Derivatives focus |
| Bitget | ✓ | - | Copy trading |
| Gate.io | ✓ | ✓ | 1000+ coins |
| KuCoin | ✓ | ✓ | Altcoin variety |

## Documentation

- **[Full Installation Guide](cex-balance/INSTALL.md)** - Detailed setup instructions
- **[Skill Documentation](cex-balance/SKILL.md)** - Complete skill reference

## Technical Details

- **Language**: Pure JavaScript (ES Modules)
- **Runtime**: Node.js 18+ (for native `fetch()`)
- **Dependencies**: ZERO - uses only Node.js built-in modules
- **API Signing**: HMAC-SHA256 using `crypto` module
- **Size**: 14 KB (compressed)

## Development

```bash
# Clone the repository
git clone https://github.com/dns7030/cexPortofolioTracker.git
cd cexPortofolioTracker/cex-balance

# The skill is ready to use - no build step!
cp env.example .env
# Edit .env with your API keys
node index.js
```

## Creating a New Release

```bash
# Create new release ZIP (with proper forward slashes for Claude.ai compatibility)
cd cexPortofolioTracker
python build-release.py

# OR use Node.js:
# node build-release.js

# DO NOT use PowerShell Compress-Archive - it creates backslashes that Claude.ai rejects!
```

## License

MIT License - See [LICENSE](cex-balance/LICENSE)

## Disclaimer

**NO WARRANTY**: This software is provided "AS IS" without warranty. You are fully responsible for:
- Securing your API keys
- Any financial losses
- Verifying balance accuracy

**USE AT YOUR OWN RISK**

## Support

- **Issues**: [GitHub Issues](https://github.com/dns7030/cexPortofolioTracker/issues)
- **Repository**: [github.com/dns7030/cexPortofolioTracker](https://github.com/dns7030/cexPortofolioTracker)

---

**Version**: 2.0.1
**Last Updated**: February 14, 2026

## Changelog

### v2.0.1 (Feb 14, 2026)
- 🔧 Fixed .env file loading - skill now automatically loads environment variables
- 📝 Updated documentation to remove npm references (true zero dependencies)
- ✅ Verified skill works with Node.js 18+ without any installation

### v2.0.0 (Feb 2, 2026)
- ✨ Added support for 4 new exchanges (Coinbase, OKX, Bybit, Bitget)
- 📈 Now supports 7 major exchanges (up from 3)
- 🔧 Updated all documentation
- 📦 Size: 19 KB (up from 14 KB)

### v1.0.0 (Jan 31, 2026)
- 🎉 Initial release
- ✅ Support for Binance, Gate.io, KuCoin
- 📦 Zero dependencies, 14 KB
