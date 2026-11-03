import http from 'node:http';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { fetchAllBalances } from '../cex-balance/lib/exchanges.js';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), 'public');
const SESSION_SECONDS = 12 * 60 * 60;
const CACHE_MS = 30_000;
const EXCHANGES = ['binance', 'gateio', 'kucoin'];
const assets = {
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
};

function safeEqual(a, b) {
  const left = crypto.createHash('sha256').update(a).digest();
  const right = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

function cookieValue(secret) {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${expiry}.${crypto.randomBytes(16).toString('hex')}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function hasSession(req, secret) {
  const raw = req.headers.cookie?.split(';').map(part => part.trim())
    .find(part => part.startsWith('cex_session='))?.slice('cex_session='.length);
  if (!raw) return false;
  const [expiry, nonce, signature, extra] = raw.split('.');
  if (extra || !/^\d{10}$/.test(expiry) || !/^[a-f0-9]{32}$/.test(nonce || '') || !/^[a-f0-9]{64}$/.test(signature || '')) return false;
  if (Number(expiry) <= Date.now() / 1000) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${expiry}.${nonce}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function send(res, status, body, type = 'application/json; charset=utf-8', headers = {}) {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    ...headers,
  });
  res.end(body);
}

async function bodyJson(req) {
  let input = '';
  for await (const chunk of req) {
    input += chunk;
    if (input.length > 4096) throw new Error('Request too large');
  }
  return JSON.parse(input);
}

export function createDashboardServer({
  password = process.env.DASHBOARD_PASSWORD,
  sessionSecret = process.env.SESSION_SECRET,
  getBalances = () => fetchAllBalances(EXCHANGES),
} = {}) {
  if (!password || password.length < 12) throw new Error('DASHBOARD_PASSWORD must have at least 12 characters');
  if (!sessionSecret || sessionSecret.length < 32) throw new Error('SESSION_SECRET must have at least 32 characters');

  const failures = new Map();
  let cached;
  let pending;

  async function balances(refresh) {
    if (!refresh && cached && Date.now() - cached.time < CACHE_MS) return cached.data;
    if (!pending) {
      pending = Promise.resolve().then(getBalances).then(exchanges => {
        const data = {
          updatedAt: new Date().toISOString(),
          exchanges,
          totalUsdValue: exchanges.reduce((sum, ex) => sum + (ex.totalUsdValue || 0), 0),
        };
        cached = { time: Date.now(), data };
        return data;
      }).finally(() => { pending = undefined; });
    }
    return pending;
  }

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const path = url.pathname;
      const authorized = hasSession(req, sessionSecret);
      const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || '');
      const secure = local ? '' : '; Secure';

      if (req.method === 'GET' && path === '/') {
        const file = authorized ? 'dashboard.html' : 'login.html';
        return send(res, 200, await readFile(join(publicDir, file)), 'text/html; charset=utf-8');
      }
      if (req.method === 'GET' && assets[path]) {
        const [file, type] = assets[path];
        return send(res, 200, await readFile(join(publicDir, file)), type);
      }
      if (req.method === 'POST' && path === '/api/login') {
        const ip = req.socket.remoteAddress || 'unknown';
        const state = failures.get(ip) || { count: 0, until: 0 };
        if (state.until > Date.now()) return send(res, 429, JSON.stringify({ error: 'Too many attempts. Try again later.' }));
        let input;
        try { input = await bodyJson(req); } catch { return send(res, 400, JSON.stringify({ error: 'Invalid request' })); }
        if (typeof input.password !== 'string' || !safeEqual(input.password, password)) {
          state.count += 1;
          state.until = state.count >= 10 ? Date.now() + 15 * 60_000 : 0;
          failures.set(ip, state);
          return send(res, 401, JSON.stringify({ error: 'Incorrect password' }));
        }
        failures.delete(ip);
        return send(res, 200, JSON.stringify({ ok: true }), undefined, {
          'Set-Cookie': `cex_session=${cookieValue(sessionSecret)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}${secure}`,
        });
      }
      if (req.method === 'POST' && path === '/api/logout') {
        return send(res, 200, JSON.stringify({ ok: true }), undefined, {
          'Set-Cookie': `cex_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`,
        });
      }
      if (req.method === 'GET' && path === '/api/balances') {
        if (!authorized) return send(res, 401, JSON.stringify({ error: 'Sign in required' }));
        return send(res, 200, JSON.stringify(await balances(url.searchParams.has('refresh'))));
      }
      if (req.method === 'GET' && path === '/health') return send(res, 200, JSON.stringify({ ok: true }));
      return send(res, 404, JSON.stringify({ error: 'Not found' }));
    } catch (error) {
      console.error('Dashboard request failed:', error.message);
      return send(res, 500, JSON.stringify({ error: 'Unable to load balances right now' }));
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.PORT || 3000);
  createDashboardServer().listen(port, '0.0.0.0', () => {
    console.log(`Dashboard listening on port ${port}`);
  });
}
