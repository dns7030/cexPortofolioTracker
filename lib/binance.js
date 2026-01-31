import crypto from 'crypto';

const BINANCE_API_BASE = 'https://api.binance.com';

function signRequest(queryString, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(queryString)
    .digest('hex');
}

export async function getBinanceSpotBalance(apiKey, secret) {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = signRequest(queryString, secret);

  const url = `${BINANCE_API_BASE}/api/v3/account?${queryString}&signature=${signature}`;

  const response = await fetch(url, {
    headers: {
      'X-MBX-APIKEY': apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Binance API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Parse balances
  const balances = [];
  if (data.balances) {
    for (const item of data.balances) {
      const free = parseFloat(item.free);
      const locked = parseFloat(item.locked);
      const total = free + locked;

      if (total > 0) {
        balances.push({
          symbol: item.asset,
          amount: total,
        });
      }
    }
  }

  return balances;
}

export async function getBinanceEarnBalance(apiKey, secret) {
  const earnAssets = [];

  try {
    // Try Simple Earn Flexible positions
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = signRequest(queryString, secret);

    const url = `${BINANCE_API_BASE}/sapi/v1/simple-earn/flexible/position?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.rows) {
        for (const item of data.rows) {
          const amount = parseFloat(item.totalAmount || '0');
          if (amount > 0 && item.asset) {
            earnAssets.push({
              symbol: item.asset,
              amount,
            });
          }
        }
      }
    }
  } catch {
    // Flexible earn not available or no permissions
  }

  try {
    // Try Simple Earn Locked positions
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = signRequest(queryString, secret);

    const url = `${BINANCE_API_BASE}/sapi/v1/simple-earn/locked/position?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.rows) {
        for (const item of data.rows) {
          const amount = parseFloat(item.amount || '0');
          if (amount > 0 && item.asset) {
            earnAssets.push({
              symbol: item.asset,
              amount,
            });
          }
        }
      }
    }
  } catch {
    // Locked earn not available
  }

  return earnAssets;
}

export async function getBinanceTickers(symbols) {
  const prices = new Map();

  try {
    // Fetch all tickers
    const response = await fetch(`${BINANCE_API_BASE}/api/v3/ticker/price`);

    if (response.ok) {
      const data = await response.json();

      // Create a map of symbol -> price
      const tickerMap = new Map();
      for (const ticker of data) {
        tickerMap.set(ticker.symbol, parseFloat(ticker.price));
      }

      // Look up prices for each symbol via USDT pair
      for (const symbol of symbols) {
        const usdtPair = `${symbol}USDT`;
        if (tickerMap.has(usdtPair)) {
          prices.set(symbol, tickerMap.get(usdtPair));
        }
      }
    }
  } catch {
    // Price lookup failed
  }

  return prices;
}
