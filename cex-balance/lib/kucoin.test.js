import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getKucoinEarnBalance, getKucoinFundingBalance } from './kucoin.js';

test('KuCoin funding and Earn use separate account endpoints and paginate Earn holdings', async () => {
  const originalFetch = globalThis.fetch;
  const called = [];
  globalThis.fetch = async (url, options) => {
    called.push({ url: String(url), headers: options.headers });
    const data = String(url).includes('/hold-assets')
      ? String(url).includes('currentPage=1')
        ? { totalPage: 2, items: [{ currency: 'KCS', holdAmount: '1.25' }] }
        : { totalPage: 2, items: [{ currency: 'KCS', holdAmount: '0.75' }] }
      : [{ type: 'main', currency: 'USDT', available: '10', holds: '2' }, { type: 'trade', currency: 'BTC', available: '1', holds: '0' }];
    return { ok: true, json: async () => ({ code: '200000', data }) };
  };
  try {
    const funding = await getKucoinFundingBalance('key', 'secret', 'passphrase');
    const earn = await getKucoinEarnBalance('key', 'secret', 'passphrase');
    assert.deepEqual(funding, [{ symbol: 'USDT', amount: 12 }]);
    assert.deepEqual(earn, [{ symbol: 'KCS', amount: 2 }]);
    assert.equal(called.length, 3);
    assert.ok(called[1].url.includes('currentPage=1'));
    assert.ok(called[2].url.includes('currentPage=2'));
    assert.equal(called[1].headers['KC-API-KEY-VERSION'], '2');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
