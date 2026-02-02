import crypto from 'crypto';

const COINBASE_API_BASE = 'https://api.coinbase.com';

function signRequest(timestamp, method, requestPath, body, secret) {
  const message = timestamp + method + requestPath + (body || '');
  return crypto
    .createHmac('sha256', Buffer.from(secret, 'base64'))
    .update(message)
    .digest('base64');
}

export async function getCoinbaseSpotBalance(apiKey, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const method = 'GET';
  const requestPath = '/v2/accounts';

  const signature = signRequest(timestamp, method, requestPath, '', secret);

  const url = `${COINBASE_API_BASE}${requestPath}`;

  const response = await fetch(url, {
    headers: {
      'CB-ACCESS-KEY': apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp.toString(),
      'CB-VERSION': '2021-01-01',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Coinbase API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Parse balances
  const balances = [];
  if (data.data) {
    for (const account of data.data) {
      const amount = parseFloat(account.balance?.amount || '0');

      if (amount > 0 && account.currency) {
        balances.push({
          symbol: account.currency,
          amount,
        });
      }
    }
  }

  return balances;
}

export async function getCoinbaseTickers() {
  const url = `${COINBASE_API_BASE}/v2/exchange-rates?currency=USD`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Coinbase tickers API error: ${response.status}`);
  }

  const data = await response.json();
  const tickers = {};

  if (data.data?.rates) {
    // Coinbase returns rates as USD per 1 unit of currency
    for (const [symbol, rate] of Object.entries(data.data.rates)) {
      const price = 1 / parseFloat(rate);
      if (price > 0) {
        tickers[symbol] = price;
      }
    }
  }

  return tickers;
}
