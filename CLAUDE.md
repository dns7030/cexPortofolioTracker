# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 14 App Router application that displays cryptocurrency portfolio balances from multiple centralized exchanges (Binance, KuCoin, Gate.io).

### Data Flow

1. **API Route** (`src/app/api/portfolio/route.ts`) - Single endpoint that fetches balances from all configured exchanges in parallel
2. **Exchange Service** (`src/lib/exchanges.ts`) - CCXT wrapper that handles:
   - Exchange instance creation with API credentials from env vars
   - Fetching spot balances via `fetchBalance()`
   - Fetching Earn/Savings balances via exchange-specific SAPI endpoints
   - Price lookups via USDT trading pairs
3. **React Query** - Client-side data fetching with caching (configured in `Providers.tsx`)

### Key Types (`src/lib/types.ts`)

- `ExchangeName`: `'binance' | 'kucoin' | 'gateio'`
- `AccountType`: `'spot' | 'earn' | 'margin' | 'futures'`
- `Asset`: Individual holding with symbol, amount, price, usdValue
- `ExchangeBalance`: Per-exchange assets and total
- `PortfolioData`: Full API response with all exchanges

### Exchange Configuration

API keys are read from environment variables in `getExchangeConfigs()`. Each exchange returns `null` from `createExchangeInstance()` if credentials are missing, allowing partial configuration.

## Environment Setup

Copy `.env.example` to `.env.local` and add exchange API keys. Only read-only API permissions are needed.

