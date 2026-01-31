import crypto from 'crypto';

const GATE_API_BASE = 'https://api.gateio.ws';

function signRequest(method, url, queryString, bodyHash, timestamp, secret) {
  const message = `${method}\n${url}\n${queryString}\n${bodyHash}\n${timestamp}`;
  return crypto
    .createHmac('sha512', secret)
    .update(message)
    .digest('hex');
}

export async function getGateSpotBalance(apiKey, secret) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const method = 'GET';
  const url = '/api/v4/spot/accounts';
  const queryString = '';
  const bodyHash = crypto.createHash('sha512').update('').digest('hex');

  const signature = signRequest(method, url, queryString, bodyHash, timestamp, secret);

  const fullUrl = `${GATE_API_BASE}${url}`;

  const response = await fetch(fullUrl, {
    headers: {
      'KEY': apiKey,
      'SIGN': signature,
      'Timestamp': timestamp,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gate.io API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Parse balances
  const balances = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      const available = parseFloat(item.available || '0');
      const locked = parseFloat(item.locked || '0');
      const total = available + locked;

      if (total > 0 && item.currency) {
        balances.push({
          symbol: item.currency,
          amount: total,
        });
      }
    }
  }

  return balances;
}

export async function getGateEarnBalance(apiKey, secret) {
  const earnAssets = [];

  try {
    // Try to get unified lending positions
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = 'GET';
    const url = '/api/v4/earn/uni/lends';
    const queryString = '';
    const bodyHash = crypto.createHash('sha512').update('').digest('hex');

    const signature = signRequest(method, url, queryString, bodyHash, timestamp, secret);

    const fullUrl = `${GATE_API_BASE}${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        'KEY': apiKey,
        'SIGN': signature,
        'Timestamp': timestamp,
      },
    });

    if (response.ok) {
      const data = await response.json();

      if (Array.isArray(data)) {
        for (const item of data) {
          const amount = parseFloat(item.amount || item.current_amount || '0');
          if (amount > 0 && item.currency) {
            earnAssets.push({
              symbol: item.currency,
              amount,
            });
          }
        }
      }
    }
  } catch {
    // Earn API not available or no permissions
  }

  return earnAssets;
}

export async function getGateTickers(symbols) {
  const prices = new Map();

  try {
    // Fetch all tickers
    const response = await fetch(`${GATE_API_BASE}/api/v4/spot/tickers`);

    if (response.ok) {
      const data = await response.json();

      if (Array.isArray(data)) {
        // Create a map of symbol -> price
        const tickerMap = new Map();
        for (const ticker of data) {
          tickerMap.set(ticker.currency_pair, parseFloat(ticker.last));
        }

        // Look up prices for each symbol via USDT pair
        for (const symbol of symbols) {
          const usdtPair = `${symbol}_USDT`;
          if (tickerMap.has(usdtPair)) {
            prices.set(symbol, tickerMap.get(usdtPair));
          }
        }
      }
    }
  } catch {
    // Price lookup failed
  }

  return prices;
}
