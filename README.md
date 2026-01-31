# CEX Portfolio Tracker

A simple portfolio tracker for your Binance, KuCoin, and Gate.io holdings. Built with Next.js, TailwindCSS, and CCXT.

## Features

- View combined portfolio value across all exchanges
- Per-exchange breakdown of holdings
- Real-time USD values using exchange tickers
- Responsive design for mobile and desktop
- Deployable to Vercel

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API keys

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

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

**Important:** Only use API keys with read-only permissions. Never enable trading or withdrawal permissions for security.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your portfolio.

## Deploy to Vercel

1. Push your code to GitHub (make sure `.env.local` is in `.gitignore`)
2. Import the project in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's dashboard (Settings > Environment Variables)
4. Deploy

## Creating API Keys

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

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS
- **Exchange API:** CCXT
- **Data Fetching:** TanStack Query (React Query)
- **Language:** TypeScript

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── portfolio/
│   │       └── route.ts    # Portfolio API endpoint
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Dashboard.tsx       # Main dashboard component
│   ├── ExchangeCard.tsx    # Per-exchange card
│   ├── AssetTable.tsx      # Asset list table
│   ├── PortfolioSummary.tsx # Total value display
│   ├── LoadingSpinner.tsx  # Loading indicator
│   └── Providers.tsx       # React Query provider
└── lib/
    ├── exchanges.ts        # CCXT exchange wrapper
    └── types.ts            # TypeScript types
```

## Security Notes

- API keys are stored in environment variables, never in code
- Only read-only API permissions should be used
- The `.env.local` file is gitignored by default
- Consider IP whitelisting on your exchange API settings
