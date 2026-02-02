import crypto from 'crypto';

const BYBIT_API_BASE = 'https://api.bybit.com';

function signRequest(params, secret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHmac('sha256', secret)
    .update(sortedParams)
    .digest('hex');
}

export async function getBybitSpotBalance(apiKey, secret) {
  const timestamp = Date.now();
  const params = {
    api_key: apiKey,
    timestamp,
  };

  const signature = signRequest(params, secret);
  params.sign = signature;

  const queryString = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const url = `${BYBIT_API_BASE}/v5/account/wallet-balance?${queryString}&accountType=UNIFIED`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Bybit API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Parse balances
  const balances = [];
  if (data.result?.list?.[0]?.coin) {
    for (const item of data.result.list[0].coin) {
      const amount = parseFloat(item.walletBalance || '0');

      if (amount > 0 && item.coin) {
        balances.push({
          symbol: item.coin,
          amount,
        });
      }
    }
  }

  return balances;
}

export async function getBybitTickers() {
  const url = `${BYBIT_API_BASE}/v5/market/tickers?category=spot`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Bybit tickers API error: ${response.status}`);
  }

  const data = await response.json();
  const tickers = {};

  if (data.result?.list) {
    for (const ticker of data.result.list) {
      // Bybit uses format like "BTCUSDT"
      if (ticker.symbol?.endsWith('USDT')) {
        const symbol = ticker.symbol.replace('USDT', '');
        const price = parseFloat(ticker.lastPrice);
        if (price > 0) {
          tickers[symbol] = price;
        }
      }
    }
  }

  return tickers;
}
