# CEX Balance Skill

A Claude Code skill for checking cryptocurrency exchange balances across Binance, KuCoin, and Gate.io directly from chat.

## [WARNING] CRITICAL SECURITY DISCLAIMER

**READ THIS BEFORE USING THIS SKILL:**

1. **API KEYS ARE STORED LOCALLY** - This skill stores your exchange API keys in a `.env` file on YOUR local machine. The skill creator and contributors take **NO RESPONSIBILITY** for the security of your API keys or any losses incurred from their use.

2. **USE READ-ONLY API KEYS ONLY** - **NEVER** use API keys with trading, withdrawal, or transfer permissions. Only create API keys with **READ-ONLY** permissions on your exchange accounts.

3. **YOU ARE RESPONSIBLE FOR YOUR SECURITY** - By using this skill, you accept full responsibility for:
   - Securing your API keys
   - Ensuring your `.env` file is never committed to version control
   - Using read-only API permissions only
   - Any unauthorized access to your accounts
   - Any financial losses that may occur

4. **NO WARRANTY** - This software is provided "AS IS" without warranty of any kind. The authors are not liable for any damages or losses.

5. **VERIFY PERMISSIONS** - Before adding API keys to this skill, verify on your exchange that the keys have ONLY read permissions enabled. Disable all write/trade/withdraw permissions.

**If you don't understand these risks or are not comfortable storing API keys locally, DO NOT USE THIS SKILL.**

---

## Features

- ⚡ **ZERO INSTALLATION** - No npm install, no dependencies, just download and run!
- Check balances from multiple exchanges in one command
- View both Spot and Earn/Savings accounts
- Real-time USD pricing via USDT trading pairs
- Markdown-formatted output for easy reading
- Pure JavaScript using Node.js built-ins only

## Installation

### Prerequisites
- Node.js 18+ (for native fetch support)
- API keys from your exchanges (read-only permissions)

### Setup (2 Steps!)

1. **Download the skill**
```bash
git clone https://github.com/dns7030/cexPortofolioTracker.git
cd cexPortofolioTracker
git checkout skill
```

**OR download archive:**
- [cex-balance-skill.zip](https://github.com/dns7030/cexPortofolioTracker/blob/skill/cex-balance-skill.zip)
- [cex-balance-skill.tar.gz](https://github.com/dns7030/cexPortofolioTracker/blob/skill/cex-balance-skill.tar.gz)

2. **Configure API keys**

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your READ-ONLY API keys:
```env
# Binance API Keys (READ-ONLY permissions only!)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET=your_binance_secret

# KuCoin API Keys (READ-ONLY permissions only!)
KUCOIN_API_KEY=your_kucoin_api_key
KUCOIN_SECRET=your_kucoin_secret
KUCOIN_PASSPHRASE=your_kucoin_passphrase

# Gate.io API Keys (READ-ONLY permissions only!)
GATE_API_KEY=your_gate_api_key
GATE_SECRET=your_gate_secret
```

3. **Run immediately - ZERO INSTALLATION!**
```bash
node index.js                  # Show all balances
node index.js --summary        # Show summary only
node index.js binance          # Show only Binance
```

**That's it!** No npm install, no build, no dependencies!

## Usage in Claude Code

Once installed, use the skill in chat:

```
/cex-balance              # Check all configured exchanges
/cex-balance binance      # Check only Binance
/cex-balance --summary    # Show portfolio summary
```

## Output Format

The skill outputs markdown-formatted tables:

```markdown
## Binance
**Total Value:** $5,234.56

### Spot Account
| Asset | Amount | Price | USD Value |
|-------|--------|-------|-----------|
| BTC   | 0.12345678 | $45,000.00 | $5,555.56 |
| ETH   | 1.5        | $3,000.00  | $4,500.00 |

### Earn/Savings Account
| Asset | Amount | Price | USD Value |
|-------|--------|-------|-----------|
| USDT  | 1,000  | $1.00 | $1,000.00 |
```

## Creating Exchange API Keys (READ-ONLY ONLY!)

### [WARNING] CRITICAL: Only Enable Read Permissions

When creating API keys for this skill:
- [YES] **DO** enable: Read/View permissions only
- [NO] **DO NOT** enable: Trading, Withdrawals, Transfers, or ANY write permissions
- [YES] **DO** enable: IP whitelisting if possible (restrict to your IP)
- [NO] **DO NOT** share these keys with anyone or commit them to git

### Binance
1. Go to [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Create a new API key
3. **CRITICAL:** Enable **ONLY** "Read" permissions (uncheck all others!)
4. Enable "Enable Reading" checkbox
5. Disable ALL other permissions (Spot & Margin Trading, Futures, etc.)
6. Restrict IP access to your local IP if possible
7. Save the API key and secret immediately

### KuCoin
1. Go to [KuCoin API Management](https://www.kucoin.com/account/api)
2. Create a new API key with a passphrase
3. **CRITICAL:** Enable **ONLY** "General" permissions (read-only)
4. Do NOT enable Trading, Transfer, or Withdrawal permissions
5. Set IP restriction if possible
6. Save all credentials (API Key, Secret, Passphrase)

### Gate.io
1. Go to [Gate.io API Management](https://www.gate.io/myaccount/api_key_manage)
2. Create a new APIv4 key
3. **CRITICAL:** Enable **ONLY** read permissions
4. Permissions to enable: "Read only" for Spot, Wallet
5. Do NOT enable Trading or Withdrawal permissions
6. Bind IP address if possible
7. Save the API key and secret

## How API Keys Are Stored

**Local Storage Only:**
- API keys are stored in a `.env` file in the project root directory
- This file exists ONLY on your local machine
- The `.env` file is in `.gitignore` and will NEVER be committed to version control
- The skill reads keys from environment variables at runtime
- **No cloud storage, no remote servers** - everything runs locally

**Your Responsibility:**
- Keep your `.env` file secure
- Never share or commit your `.env` file
- Regularly rotate your API keys
- Monitor your exchange account for suspicious activity
- Immediately revoke keys if you suspect compromise

## Project Structure

```
index.js              # Skill entry point - pure JavaScript!
lib/
├── binance.js        # Native Binance API client (crypto + fetch)
├── kucoin.js         # Native KuCoin API client
├── gateio.js         # Native Gate.io API client
└── exchanges.js      # Main orchestration logic
skill.json            # Skill manifest
.env                  # Your API keys (local only, never committed)
```

## Tech Stack

- **Language:** Pure JavaScript (ES Modules)
- **Dependencies:** NONE! Uses Node.js built-ins only
  - `crypto` module for HMAC-SHA256 signing
  - `fetch()` for HTTP requests
  - `process.env` for configuration
- **Runtime:** Node.js 18+ (for native fetch support)
- **Installation:** Download and run - that's it!
- **Size:** ~25KB total (vs 4.5MB with CCXT)

## License

MIT
