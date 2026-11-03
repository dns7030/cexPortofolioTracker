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

async function getPrivate(apiKey, secret, passphrase, endpoint) {
  const timestamp = Date.now().toString();
  const method = 'GET';

  const signature = signRequest(timestamp, method, endpoint, '', secret);
  const passphraseSignature = generatePassphrase(passphrase, secret);

  const url = `${KUCOIN_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'KC-API-KEY': apiKey,
      'KC-API-SIGN': signature,
      'KC-API-TIMESTAMP': timestamp,
      'KC-API-PASSPHRASE': passphraseSignature,
      'KC-API-KEY-VERSION': process.env.KUCOIN_API_KEY_VERSION || '2',
      'Content-Type': 'application/json',
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

  return result.data;
}

export async function getKucoinSpotBalance(apiKey, secret, passphrase) {
  const data = await getPrivate(apiKey, secret, passphrase, '/api/v1/accounts');
  const balances = [];
  if (data) {
    for (const item of data) {
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

export async function getKucoinFundingBalance(apiKey, secret, passphrase) {
  const data = await getPrivate(apiKey, secret, passphrase, '/api/v1/accounts');
  return (data || []).filter(item => item.type === 'main').map(item => ({
    symbol: item.currency,
    amount: Number(item.available || 0) + Number(item.holds || 0),
  })).filter(item => item.symbol && item.amount > 0);
}

export async function getKucoinEarnBalance(apiKey, secret, passphrase) {
  const balances = new Map();
  for (let page = 1; page <= 100; page++) {
    const data = await getPrivate(apiKey, secret, passphrase,
      `/api/v1/earn/hold-assets?currentPage=${page}&pageSize=100`);
    for (const item of data?.items || []) {
      const amount = Number(item.holdAmount || 0);
      if (item.currency && amount > 0) {
        balances.set(item.currency, (balances.get(item.currency) || 0) + amount);
      }
    }
    if (!data || page >= Number(data.totalPage || 1)) break;
  }
  return [...balances].map(([symbol, amount]) => ({ symbol, amount }));
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
