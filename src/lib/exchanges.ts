import * as ccxt from 'ccxt';
import { ExchangeBalance, ExchangeConfig, ExchangeName, Asset, AccountType } from './types.js';

const STABLECOINS = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'UST', 'FRAX'];

function getExchangeConfigs(): ExchangeConfig[] {
  return [
    {
      name: 'binance',
      displayName: 'Binance',
      apiKey: process.env.BINANCE_API_KEY,
      secret: process.env.BINANCE_SECRET,
    },
    {
      name: 'kucoin',
      displayName: 'KuCoin',
      apiKey: process.env.KUCOIN_API_KEY,
      secret: process.env.KUCOIN_SECRET,
      password: process.env.KUCOIN_PASSPHRASE,
    },
    {
      name: 'gateio',
      displayName: 'Gate.io',
      apiKey: process.env.GATE_API_KEY,
      secret: process.env.GATE_SECRET,
    },
  ];
}

function createExchangeInstance(config: ExchangeConfig): ccxt.Exchange | null {
  if (!config.apiKey || !config.secret) {
    return null;
  }

  const options: { apiKey: string; secret: string; password?: string } = {
    apiKey: config.apiKey,
    secret: config.secret,
  };

  if (config.password) {
    options.password = config.password;
  }

  switch (config.name) {
    case 'binance':
      return new ccxt.binance(options);
    case 'kucoin':
      return new ccxt.kucoin(options);
    case 'gateio':
      return new ccxt.gateio(options);
    default:
      return null;
  }
}

async function fetchPrices(
  exchange: ccxt.Exchange,
  symbols: string[]
): Promise<Map<string, number>> {
  const prices = new Map<string, number>();

  // Set stablecoin prices to 1
  for (const stable of STABLECOINS) {
    prices.set(stable, 1);
  }
  prices.set('USD', 1);

  // Get unique non-stablecoin symbols
  const nonStableSymbols = symbols.filter(
    (s) => !STABLECOINS.includes(s) && s !== 'USD'
  );

  if (nonStableSymbols.length === 0) {
    return prices;
  }

  try {
    // Try to fetch tickers for symbols with USDT pair
    const tickerSymbols = nonStableSymbols.map((s) => `${s}/USDT`);
    const tickers = await exchange.fetchTickers(tickerSymbols);

    for (const [symbol, ticker] of Object.entries(tickers)) {
      const base = symbol.split('/')[0];
      if (ticker.last) {
        prices.set(base, ticker.last);
      }
    }
  } catch {
    // If batch fetch fails, try individual fetches
    for (const symbol of nonStableSymbols) {
      try {
        const ticker = await exchange.fetchTicker(`${symbol}/USDT`);
        if (ticker.last) {
          prices.set(symbol, ticker.last);
        }
      } catch {
        // Try with USD pair as fallback
        try {
          const ticker = await exchange.fetchTicker(`${symbol}/USD`);
          if (ticker.last) {
            prices.set(symbol, ticker.last);
          }
        } catch {
          // Price not found, will be 0
        }
      }
    }
  }

  return prices;
}

// Fetch Binance Earn (Simple Earn / Savings) balances
async function fetchBinanceEarnBalances(
  exchange: ccxt.Exchange
): Promise<{ symbol: string; amount: number }[]> {
  const earnAssets: { symbol: string; amount: number }[] = [];

  try {
    // Binance Simple Earn Flexible positions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flexibleResponse = await (exchange as any).sapiGetSimpleEarnFlexiblePosition({});
    if (flexibleResponse && flexibleResponse.rows) {
      for (const item of flexibleResponse.rows) {
        const amount = parseFloat(item.totalAmount || '0');
        if (amount > 0 && item.asset) {
          earnAssets.push({
            symbol: item.asset.toUpperCase(),
            amount,
          });
        }
      }
    }
  } catch {
    // Try legacy savings endpoint
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const savingsResponse = await (exchange as any).sapiGetLendingUnionAccount({});
      if (savingsResponse && savingsResponse.positionAmountVos) {
        for (const item of savingsResponse.positionAmountVos) {
          const amount = parseFloat(item.amount || '0');
          if (amount > 0 && item.asset) {
            earnAssets.push({
              symbol: item.asset.toUpperCase(),
              amount,
            });
          }
        }
      }
    } catch {
      // Earn API not available or no permissions
    }
  }

  // Also try locked earn products
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lockedResponse = await (exchange as any).sapiGetSimpleEarnLockedPosition({});
    if (lockedResponse && lockedResponse.rows) {
      for (const item of lockedResponse.rows) {
        const amount = parseFloat(item.amount || '0');
        if (amount > 0 && item.asset) {
          earnAssets.push({
            symbol: item.asset.toUpperCase(),
            amount,
          });
        }
      }
    }
  } catch {
    // Locked earn not available
  }

  return earnAssets;
}

// Fetch KuCoin Earn balances
async function fetchKucoinEarnBalances(
  exchange: ccxt.Exchange
): Promise<{ symbol: string; amount: number }[]> {
  const earnAssets: { symbol: string; amount: number }[] = [];

  try {
    // KuCoin Earn (savings) positions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (exchange as any).privateGetEarnOrders({
      status: 'HOLDING',
    });

    if (response && response.data && response.data.items) {
      for (const item of response.data.items) {
        const amount = parseFloat(item.holdAmount || item.amount || '0');
        if (amount > 0 && item.currency) {
          earnAssets.push({
            symbol: item.currency.toUpperCase(),
            amount,
          });
        }
      }
    }
  } catch {
    // Try alternative endpoint
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const savingsResponse = await (exchange as any).privateGetSavingsHolding({});
      if (savingsResponse && savingsResponse.data) {
        for (const item of savingsResponse.data) {
          const amount = parseFloat(item.holdAmount || '0');
          if (amount > 0 && item.currency) {
            earnAssets.push({
              symbol: item.currency.toUpperCase(),
              amount,
            });
          }
        }
      }
    } catch {
      // Earn API not available or no permissions
    }
  }

  return earnAssets;
}

// Fetch Gate.io Earn (savings) balances
async function fetchGateEarnBalances(
  exchange: ccxt.Exchange
): Promise<{ symbol: string; amount: number }[]> {
  const earnAssets: { symbol: string; amount: number }[] = [];

  try {
    // Gate.io Earn API endpoint for savings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (exchange as any).privateEarnGetUniLends({});

    if (Array.isArray(response)) {
      for (const item of response) {
        const amount = parseFloat(item.amount || item.current_amount || '0');
        if (amount > 0 && item.currency) {
          earnAssets.push({
            symbol: item.currency.toUpperCase(),
            amount,
          });
        }
      }
    }
  } catch {
    // Try alternative endpoint
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await (exchange as any).privateEarnGetUniLendRecords({});
      if (Array.isArray(response)) {
        for (const item of response) {
          const amount = parseFloat(item.amount || '0');
          if (amount > 0 && item.currency) {
            earnAssets.push({
              symbol: item.currency.toUpperCase(),
              amount,
            });
          }
        }
      }
    } catch {
      // Earn API not available or no permissions
    }
  }

  return earnAssets;
}

// Fetch Earn balances based on exchange
async function fetchEarnBalances(
  exchange: ccxt.Exchange,
  exchangeName: ExchangeName
): Promise<{ symbol: string; amount: number }[]> {
  switch (exchangeName) {
    case 'binance':
      return fetchBinanceEarnBalances(exchange);
    case 'kucoin':
      return fetchKucoinEarnBalances(exchange);
    case 'gateio':
      return fetchGateEarnBalances(exchange);
    default:
      return [];
  }
}

async function fetchExchangeBalance(
  config: ExchangeConfig
): Promise<ExchangeBalance> {
  const exchange = createExchangeInstance(config);

  if (!exchange) {
    return {
      exchange: config.name,
      displayName: config.displayName,
      assets: [],
      totalUsdValue: 0,
      error: 'API keys not configured',
    };
  }

  try {
    const balance = await exchange.fetchBalance();

    // Get non-zero spot balances
    const allAssets: { symbol: string; amount: number; accountType: AccountType }[] = [];

    for (const [symbol, data] of Object.entries(balance.total || {})) {
      const amount = data as number;
      if (amount > 0) {
        allAssets.push({ symbol, amount, accountType: 'spot' });
      }
    }

    // Fetch Earn balances for all exchanges
    const earnAssets = await fetchEarnBalances(exchange, config.name);
    for (const { symbol, amount } of earnAssets) {
      allAssets.push({ symbol, amount, accountType: 'earn' });
    }

    if (allAssets.length === 0) {
      return {
        exchange: config.name,
        displayName: config.displayName,
        assets: [],
        totalUsdValue: 0,
      };
    }

    // Fetch prices for all unique symbols
    const uniqueSymbols = [...new Set(allAssets.map((a) => a.symbol))];
    const prices = await fetchPrices(exchange, uniqueSymbols);

    // Calculate USD values
    const assets: Asset[] = allAssets.map(({ symbol, amount, accountType }) => {
      const price = prices.get(symbol) || 0;
      return {
        symbol,
        amount,
        price,
        usdValue: amount * price,
        accountType,
      };
    });

    // Sort by USD value descending
    assets.sort((a, b) => b.usdValue - a.usdValue);

    const totalUsdValue = assets.reduce((sum, a) => sum + a.usdValue, 0);

    return {
      exchange: config.name,
      displayName: config.displayName,
      assets,
      totalUsdValue,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      exchange: config.name,
      displayName: config.displayName,
      assets: [],
      totalUsdValue: 0,
      error: errorMessage,
    };
  }
}

export async function fetchAllBalances(): Promise<ExchangeBalance[]> {
  const configs = getExchangeConfigs();

  // Fetch all balances in parallel
  const balances = await Promise.all(
    configs.map((config) => fetchExchangeBalance(config))
  );

  return balances;
}

export function getConfiguredExchanges(): ExchangeName[] {
  const configs = getExchangeConfigs();
  return configs
    .filter((c) => c.apiKey && c.secret)
    .map((c) => c.name);
}
