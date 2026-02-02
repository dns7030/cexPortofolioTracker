import crypto from 'crypto';

const BITGET_API_BASE = 'https://api.bitget.com';

function signRequest(timestamp, method, requestPath, body, secret) {
  const message = timestamp + method + requestPath + (body || '');
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64');
}

export async function getBitgetSpotBalance(apiKey, secret, passphrase) {
  const timestamp = Date.now().toString();
  const method = 'GET';
  const requestPath = '/api/v2/spot/account/assets';

  const signature = signRequest(timestamp, method, requestPath, '', secret);

  const url = `${BITGET_API_BASE}${requestPath}`;

  const response = await fetch(url, {
    headers: {
      'ACCESS-KEY': apiKey,
      'ACCESS-SIGN': signature,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-PASSPHRASE': passphrase,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Bitget API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Parse balances
  const balances = [];
  if (data.data) {
    for (const item of data.data) {
      const amount = parseFloat(item.available || '0') + parseFloat(item.frozen || '0');

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

export async function getBitgetTickers() {
  const url = `${BITGET_API_BASE}/api/v2/spot/market/tickers`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Bitget tickers API error: ${response.status}`);
  }

  const data = await response.json();
  const tickers = {};

  if (data.data) {
    for (const ticker of data.data) {
      // Bitget uses format like "BTCUSDT"
      if (ticker.symbol?.endsWith('USDT')) {
        const symbol = ticker.symbol.replace('USDT', '');
        const price = parseFloat(ticker.lastPr);
        if (price > 0) {
          tickers[symbol] = price;
        }
      }
    }
  }

  return tickers;
}
