---
name: cex-balance
description: Check cryptocurrency exchange balances across 7 major exchanges (Binance, Coinbase, OKX, Bybit, Bitget, Gate.io, KuCoin). Shows spot and earn/savings balances with USD values. Use when asked about crypto portfolio, exchange balances, or holdings.
---

# CEX Balance Checker

Check your cryptocurrency exchange balances across 7 major centralized exchanges directly from Claude Code chat.

## Supported Exchanges

1. **Binance** - World's largest exchange
2. **Coinbase** - Major US exchange
3. **OKX** - Top global exchange
4. **Bybit** - Derivatives and spot
5. **Bitget** - Fast-growing exchange
6. **Gate.io** - Wide coin selection
7. **KuCoin** - Altcoin powerhouse

**[WARNING] Geo-Restrictions:** Some exchanges (Binance, KuCoin, Bybit) block API access from US and other restricted regions. If you receive errors about restricted locations, you'll need to use a VPN with a non-restricted IP address.

## What This Skill Does

This skill allows you to:
- View your cryptocurrency holdings across multiple exchanges in one place
- Check both Spot and Earn/Savings account balances
- Get real-time USD valuations of your assets
- See a consolidated portfolio summary

## Critical Security Requirements

**IMPORTANT - READ BEFORE INSTALLING:**

1. **This skill stores API keys LOCALLY** in a `.env` file on your machine
2. **Use READ-ONLY API keys ONLY** - Never enable trading/withdrawal permissions
3. **You are fully responsible** for securing your API keys
4. The skill creator takes **NO RESPONSIBILITY** for any losses or security breaches

## Installation

### Prerequisites
- Node.js 18+ and npm installed
- Exchange accounts with API key creation capability

### Setup Steps

1. **Clone the repository:**
```bash
git clone https://github.com/dns7030/cexPortofolioTracker.git
cd cexPortofolioTracker
git checkout skill
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
cp .env.example .env
```

4. **Add your READ-ONLY API keys to `.env`:**
```env
# Binance (READ-ONLY!)
BINANCE_API_KEY=your_key_here
BINANCE_SECRET=your_secret_here

# KuCoin (READ-ONLY!)
KUCOIN_API_KEY=your_key_here
KUCOIN_SECRET=your_secret_here
KUCOIN_PASSPHRASE=your_passphrase_here

# Gate.io (READ-ONLY!)
GATE_API_KEY=your_key_here
GATE_SECRET=your_secret_here
```

5. **Run the skill - No build step needed!**
```bash
npm start
```

That's it! Pure JavaScript means no compilation required.

## Usage

Once installed, use these commands in Claude Code:

```
/cex-balance              # Check all configured exchanges
/cex-balance binance      # Check only Binance
/cex-balance kucoin       # Check only KuCoin
/cex-balance gateio       # Check only Gate.io
/cex-balance --summary    # Show portfolio summary only
```

## Example Output

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

---

**Total Portfolio Value:** $10,234.56
```

## Creating READ-ONLY API Keys

### Binance
1. Visit [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Create new API key
3. [YES] Enable ONLY "Read" permission
4. [NO] Disable ALL other permissions
5. Optional: Restrict to your IP address

### KuCoin
1. Visit [KuCoin API Management](https://www.kucoin.com/account/api)
2. Create new API key
3. [YES] Enable ONLY "General" (read-only) permission
4. [NO] Disable Trading, Transfer, Withdrawal
5. Optional: Set IP restriction

### Gate.io
1. Visit [Gate.io API Management](https://www.gate.io/myaccount/api_key_manage)
2. Create new APIv4 key
3. [YES] Enable ONLY read permissions
4. [NO] Disable Trading and Withdrawal
5. Optional: Bind IP address

## Technical Details

- **Language:** Pure JavaScript (ES Modules) - No build step!
- **Runtime:** Node.js 18+ (ES Modules)
- **Dependencies:** Only CCXT (cryptocurrency exchange library)
- **Storage:** Local `.env` file (never committed to git)
- **Network:** Direct API calls to exchanges (no intermediary servers)
- **Installation:** Clone, npm install, add API keys, run!

## Troubleshooting

**"No exchanges configured" error:**
- Check that your `.env` file exists and contains valid API keys
- Verify API keys are correct on your exchange
- Ensure you're in the correct directory when running the skill

**"API key invalid" error:**
- Regenerate API keys on your exchange
- Ensure read permissions are enabled
- Check for typos in `.env` file

**Balances showing zero:**
- Verify you have assets in your exchange account
- Check that API key has permission to view account balances
- Some exchanges may require specific permissions for Earn/Savings products

**"Service unavailable from restricted location" or geo-restriction errors:**
- Exchanges like Binance, KuCoin, and Bybit block API access from US and other restricted regions
- Solution: Use a VPN connected to a non-restricted country (e.g., Europe, Asia)
- The skill runs locally on your machine, so your VPN settings will apply to all API calls

## Security Best Practices

1. [YES] Only use READ-ONLY API keys
2. [YES] Enable IP whitelisting on exchange
3. [YES] Regularly rotate API keys
4. [YES] Monitor account for suspicious activity
5. [NO] Never share your API keys
6. [NO] Never commit `.env` to version control
7. [NO] Never enable trading/withdrawal permissions

## Disclaimer

**NO WARRANTY:** This software is provided "AS IS" without warranty. The authors are not liable for:
- Lost funds due to compromised API keys
- Incorrect balance reporting
- Exchange API changes
- Any other damages or losses

**USE AT YOUR OWN RISK.** You are fully responsible for the security of your API keys and accounts.

## Support

- GitHub Issues: https://github.com/dns7030/cexPortofolioTracker/issues
- Repository: https://github.com/dns7030/cexPortofolioTracker
- Branch: `skill`

## License

MIT - See LICENSE file for details
