# CEX Balance Skill

A Claude Code skill for checking cryptocurrency exchange balances across Binance, KuCoin, and Gate.io directly from chat.

## Features

- Check balances from multiple exchanges in one command
- View both Spot and Earn/Savings accounts
- Real-time USD pricing via USDT trading pairs
- Markdown-formatted output for easy reading
- Lightweight - only CCXT dependency

## Installation

### Prerequisites
- Node.js 18+ and npm
- API keys from your exchanges (read-only permissions)

### Setup

1. **Clone and install**
```bash
git clone https://github.com/dns7030/cexPortofolioTracker.git
cd cexPortofolioTracker
git checkout skill
npm install
```

2. **Configure API keys**

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
# Binance API Keys (read-only permissions recommended)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET=your_binance_secret

# KuCoin API Keys (read-only permissions recommended)
KUCOIN_API_KEY=your_kucoin_api_key
KUCOIN_SECRET=your_kucoin_secret
KUCOIN_PASSPHRASE=your_kucoin_passphrase

# Gate.io API Keys (read-only permissions recommended)
GATE_API_KEY=your_gate_api_key
GATE_SECRET=your_gate_secret
```

3. **Build the skill**
```bash
npm run build
```

4. **Test locally**
```bash
npm start                  # Show all balances
npm start -- --summary     # Show summary only
npm start -- binance       # Show only Binance
```

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

## Creating Exchange API Keys

### Binance
1. Go to [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Create a new API key
3. Enable only "Read" permissions
4. Restrict IP access if possible

### KuCoin
1. Go to [KuCoin API Management](https://www.kucoin.com/account/api)
2. Create a new API key with a passphrase
3. Enable only "General" permissions (read-only)

### Gate.io
1. Go to [Gate.io API Management](https://www.gate.io/myaccount/api_key_manage)
2. Create a new APIv4 key
3. Enable only read permissions for spot accounts

## Security Notes

- API keys are stored in environment variables, never in code
- Only read-only API permissions should be used
- The `.env` file is gitignored by default
- Consider IP whitelisting on your exchange API settings
- Never commit or share your API keys

## Development

```bash
npm run build      # Compile TypeScript
npm run watch      # Watch mode for development
npm start          # Run the compiled skill
```

## Project Structure

```
src/
├── index.ts            # Skill entry point with CLI formatting
├── lib/
│   ├── exchanges.ts    # CCXT integration and balance fetching
│   └── types.ts        # TypeScript type definitions
skill.json              # Skill manifest
```

## Tech Stack

- **Language:** TypeScript
- **Exchange API:** CCXT
- **Runtime:** Node.js (ES Modules)

## License

MIT
