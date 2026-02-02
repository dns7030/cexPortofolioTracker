import crypto from 'crypto';

const KUCOIN_API_BASE = 'https://api.kucoin.com';

function signRequest(timestamp, method, endpoint, body, secret) {
  const message = timestamp + method + endpoint + (body || '');
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64');
}

function generatePassphrase(passphrase, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(passphrase)
    .digest('base64');
}

export async function getKucoinSpotBalance(apiKey, secret, passphrase) {
  const timestamp = Date.now().toString();
  const method = 'GET';
  const endpoint = '/api/v1/accounts';

  const signature = signRequest(timestamp, method, endpoint, '', secret);
  const passphraseSignature = generatePassphrase(passphrase, secret);

  const url = `${KUCOIN_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'KC-API-KEY': apiKey,
      'KC-API-SIGN': signature,
      'KC-API-TIMESTAMP': timestamp,
      'KC-API-PASSPHRASE': passphraseSignature,
      'KC-API-KEY-VERSION': '2',
    },
  });

  const result = await response.json();

  // KuCoin returns 200 even for errors, check the code field
  if (result.code && result.code !== '200000') {
    throw new Error(`KuCoin API error: ${result.code} - ${result.msg || 'Unknown error'}`);
  }

  if (!response.ok) {
    const error = JSON.stringify(result);
    throw new Error(`KuCoin API error: ${response.status} - ${error}`);
  }

  // Parse balances
  const balances = [];
  if (result.data) {
    for (const item of result.data) {
      // Only get trade (spot) accounts
      if (item.type === 'trade') {
        // KuCoin returns available + holds separately
        const available = parseFloat(item.available || '0');
        const holds = parseFloat(item.holds || '0');
        const amount = available + holds;

        if (amount > 0 && item.currency) {
          balances.push({
            symbol: item.currency,
            amount,
          });
        }
      }
    }
  }

  return balances;
}

export async function getKucoinEarnBalance(apiKey, secret, passphrase) {
  const earnAssets = [];

  try {
    // Try to get earn positions
    const timestamp = Date.now().toString();
    const method = 'GET';
    const endpoint = '/api/v1/accounts';

    const signature = signRequest(timestamp, method, endpoint, '', secret);
    const passphraseSignature = generatePassphrase(passphrase, secret);

    const url = `${KUCOIN_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'KC-API-KEY': apiKey,
        'KC-API-SIGN': signature,
        'KC-API-TIMESTAMP': timestamp,
        'KC-API-PASSPHRASE': passphraseSignature,
        'KC-API-KEY-VERSION': '2',
      },
    });

    if (response.ok) {
      const result = await response.json();

      // KuCoin returns 200 even for errors, check the code field
      if (result.code && result.code !== '200000') {
        return earnAssets; // Return empty array on error
      }

      if (result.data) {
        for (const item of result.data) {
          // Get main (earn/savings) accounts
          if (item.type === 'main') {
            // KuCoin returns available + holds separately
            const available = parseFloat(item.available || '0');
            const holds = parseFloat(item.holds || '0');
            const amount = available + holds;

            if (amount > 0 && item.currency) {
              earnAssets.push({
                symbol: item.currency,
                amount,
              });
            }
          }
        }
      }
    }
  } catch {
    // Earn API not available or no permissions
  }

  return earnAssets;
}

export async function getKucoinTickers(symbols) {
  const prices = new Map();

  try {
    // Fetch all tickers
    const response = await fetch(`${KUCOIN_API_BASE}/api/v1/market/allTickers`);

    if (response.ok) {
      const result = await response.json();

      if (result.data && result.data.ticker) {
        // Create a map of symbol -> price
        const tickerMap = new Map();
        for (const ticker of result.data.ticker) {
          tickerMap.set(ticker.symbol, parseFloat(ticker.last));
        }

        // Look up prices for each symbol via USDT pair
        for (const symbol of symbols) {
          const usdtPair = `${symbol}-USDT`;
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
