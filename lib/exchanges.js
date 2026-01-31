import { getBinanceSpotBalance, getBinanceEarnBalance, getBinanceTickers } from './binance.js';
import { getKucoinSpotBalance, getKucoinEarnBalance, getKucoinTickers } from './kucoin.js';
import { getGateSpotBalance, getGateEarnBalance, getGateTickers } from './gateio.js';

const STABLECOINS = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'UST', 'FRAX'];

function getExchangeConfigs() {
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

async function fetchPrices(exchangeName, symbols, config) {
  const prices = new Map();

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
    let exchangePrices;

    switch (exchangeName) {
      case 'binance':
        exchangePrices = await getBinanceTickers(nonStableSymbols);
        break;
      case 'kucoin':
        exchangePrices = await getKucoinTickers(nonStableSymbols);
        break;
      case 'gateio':
        exchangePrices = await getGateTickers(nonStableSymbols);
        break;
      default:
        return prices;
    }

    // Merge exchange prices into our map
    for (const [symbol, price] of exchangePrices) {
      prices.set(symbol, price);
    }
  } catch {
    // Price lookup failed, use 0 for unknown prices
  }

  return prices;
}

async function fetchExchangeBalance(config) {
  if (!config.apiKey || !config.secret) {
    return {
      exchange: config.name,
      displayName: config.displayName,
      assets: [],
      totalUsdValue: 0,
      error: 'API keys not configured',
    };
  }

  try {
    const allAssets = [];

    // Fetch spot balances
    let spotBalances = [];
    switch (config.name) {
      case 'binance':
        spotBalances = await getBinanceSpotBalance(config.apiKey, config.secret);
        break;
      case 'kucoin':
        spotBalances = await getKucoinSpotBalance(config.apiKey, config.secret, config.password);
        break;
      case 'gateio':
        spotBalances = await getGateSpotBalance(config.apiKey, config.secret);
        break;
    }

    for (const { symbol, amount } of spotBalances) {
      allAssets.push({ symbol, amount, accountType: 'spot' });
    }

    // Fetch earn balances
    let earnBalances = [];
    switch (config.name) {
      case 'binance':
        earnBalances = await getBinanceEarnBalance(config.apiKey, config.secret);
        break;
      case 'kucoin':
        earnBalances = await getKucoinEarnBalance(config.apiKey, config.secret, config.password);
        break;
      case 'gateio':
        earnBalances = await getGateEarnBalance(config.apiKey, config.secret);
        break;
    }

    for (const { symbol, amount } of earnBalances) {
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
    const prices = await fetchPrices(config.name, uniqueSymbols, config);

    // Calculate USD values
    const assets = allAssets.map(({ symbol, amount, accountType }) => {
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

export async function fetchAllBalances() {
  const configs = getExchangeConfigs();

  // Fetch all balances in parallel
  const balances = await Promise.all(
    configs.map((config) => fetchExchangeBalance(config))
  );

  return balances;
}

export function getConfiguredExchanges() {
  const configs = getExchangeConfigs();
  return configs
    .filter((c) => c.apiKey && c.secret)
    .map((c) => c.name);
}
