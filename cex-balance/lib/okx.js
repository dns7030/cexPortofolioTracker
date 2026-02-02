import crypto from 'crypto';

const OKX_API_BASE = 'https://www.okx.com';

function signRequest(timestamp, method, requestPath, body, secret) {
  const message = timestamp + method + requestPath + (body || '');
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64');
}

export async function getOKXSpotBalance(apiKey, secret, passphrase) {
  const timestamp = new Date().toISOString();
  const method = 'GET';
  const requestPath = '/api/v5/account/balance';

  const signature = signRequest(timestamp, method, requestPath, '', secret);

  const url = `${OKX_API_BASE}${requestPath}`;

  const response = await fetch(url, {
    headers: {
      'OK-ACCESS-KEY': apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': passphrase,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OKX API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  // Parse balances
  const balances = [];
  if (data.data && data.data[0]?.details) {
    for (const item of data.data[0].details) {
      const amount = parseFloat(item.cashBal || '0');

      if (amount > 0 && item.ccy) {
        balances.push({
          symbol: item.ccy,
          amount,
        });
      }
    }
  }

  return balances;
}

export async function getOKXEarnBalance(apiKey, secret, passphrase) {
  const earnAssets = [];

  try {
    const timestamp = new Date().toISOString();
    const method = 'GET';
    const requestPath = '/api/v5/finance/savings/balance';

    const signature = signRequest(timestamp, method, requestPath, '', secret);

    const url = `${OKX_API_BASE}${requestPath}`;

    const response = await fetch(url, {
      headers: {
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data) {
        for (const item of data.data) {
          const amount = parseFloat(item.amt || '0');
          if (amount > 0 && item.ccy) {
            earnAssets.push({
              symbol: item.ccy,
              amount,
            });
          }
        }
      }
    }
  } catch {
    // Earn/Savings not available or no permissions
  }

  return earnAssets;
}

export async function getOKXTickers() {
  const url = `${OKX_API_BASE}/api/v5/market/tickers?instType=SPOT`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OKX tickers API error: ${response.status}`);
  }

  const data = await response.json();
  const tickers = {};

  if (data.data) {
    for (const ticker of data.data) {
      // OKX uses format like "BTC-USDT"
      const parts = ticker.instId?.split('-');
      if (parts && parts.length === 2 && parts[1] === 'USDT') {
        const symbol = parts[0];
        const price = parseFloat(ticker.last);
        if (price > 0) {
          tickers[symbol] = price;
        }
      }
    }
  }

  return tickers;
}
