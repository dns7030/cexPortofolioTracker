import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createDashboardServer } from './server.js';

const server = createDashboardServer({
  password: 'correct horse battery staple',
  sessionSecret: 'a-test-session-secret-with-enough-characters',
  getBalances: async () => [{
    exchange: 'binance', displayName: 'Binance', assets: [{ symbol: 'BTC', amount: 1, usdValue: 50, accountType: 'spot' }], totalUsdValue: 50,
  }],
});
let base;

before(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test('private balances require a valid session', async () => {
  const response = await fetch(`${base}/api/balances`);
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('password login, dashboard data, and logout', async () => {
  const invalid = await fetch(`${base}/api/login`, { method: 'POST', body: JSON.stringify({ password: 'wrong' }) });
  assert.equal(invalid.status, 401);
  const valid = await fetch(`${base}/api/login`, { method: 'POST', body: JSON.stringify({ password: 'correct horse battery staple' }) });
  assert.equal(valid.status, 200);
  const cookie = valid.headers.get('set-cookie').split(';')[0];
  assert.match(valid.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  const response = await fetch(`${base}/api/balances`, { headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.totalUsdValue, 50);
  assert.equal(result.exchanges[0].assets[0].symbol, 'BTC');
  const logout = await fetch(`${base}/api/logout`, { method: 'POST', headers: { Cookie: cookie } });
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
});

test('sign-in page does not expose portfolio data', async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /Dashboard password/);
  assert.doesNotMatch(body, /BTC/);
});
