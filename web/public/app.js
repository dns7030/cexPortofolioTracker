const loginForm = document.querySelector('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const button = loginForm.querySelector('button');
    const error = document.querySelector('#login-error');
    button.disabled = true;
    error.hidden = true;
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginForm.querySelector('#password').value }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Sign in failed');
      location.assign('/');
    } catch (cause) {
      error.textContent = cause.message;
      error.hidden = false;
      button.disabled = false;
    }
  });
}

const list = document.querySelector('#exchange-list');
if (list) {
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  const quantity = value => new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(value || 0);
  const names = { binance: 'Binance', gateio: 'Gate', kucoin: 'KuCoin' };
  const marks = { binance: 'B', gateio: 'G', kucoin: 'K' };
  const refreshButton = document.querySelector('#refresh');

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function renderExchange(exchange) {
    const card = element('article', 'exchange-card');
    const header = element('div', 'exchange-head');
    const identity = element('div', 'exchange-identity');
    identity.append(element('span', `exchange-mark ${exchange.exchange}`, marks[exchange.exchange] || '?'));
    const text = element('div');
    text.append(element('h3', '', names[exchange.exchange] || exchange.displayName));
    text.append(element('span', 'exchange-status', exchange.error === 'API keys not configured' ? 'Not connected' : exchange.error ? 'Connection error' : 'Connected'));
    identity.append(text);
    header.append(identity, element('strong', 'exchange-total', exchange.error ? '—' : money(exchange.totalUsdValue)));
    card.append(header);
    if (exchange.error) {
      card.append(element('p', 'exchange-message', exchange.error === 'API keys not configured' ? 'Add this exchange’s read-only API credentials in Railway Variables to connect it.' : exchange.error));
      return card;
    }
    for (const warning of exchange.warnings || []) card.append(element('p', 'exchange-warning', warning));
    if (!exchange.assets?.length) {
      card.append(element('p', 'exchange-message', 'No balances found in the supported accounts.'));
      return card;
    }
    const table = element('table', 'asset-table');
    const thead = element('thead');
    const titles = element('tr');
    for (const label of ['Asset', 'Account', 'Amount', 'Est. value']) titles.append(element('th', '', label));
    thead.append(titles);
    const tbody = element('tbody');
    for (const asset of exchange.assets) {
      const row = element('tr');
      row.append(element('td', 'symbol', asset.symbol));
      row.append(element('td', 'account-type', asset.accountType));
      row.append(element('td', 'number', quantity(asset.amount)));
      row.append(element('td', 'number value', money(asset.usdValue)));
      tbody.append(row);
    }
    table.append(thead, tbody);
    const tableWrap = element('div', 'table-wrap');
    tableWrap.append(table);
    card.append(tableWrap);
    return card;
  }

  async function load(force = false) {
    refreshButton.disabled = true;
    refreshButton.querySelector('span').textContent = 'Refreshing…';
    const error = document.querySelector('#page-error');
    error.hidden = true;
    try {
      const response = await fetch(`/api/balances${force ? '?refresh=1' : ''}`, { cache: 'no-store' });
      if (response.status === 401) return location.assign('/');
      if (!response.ok) throw new Error('Balances are unavailable right now. Try refreshing.');
      const data = await response.json();
      const connected = data.exchanges.filter(exchange => !exchange.error);
      const partial = connected.length < data.exchanges.length;
      document.querySelector('#total').textContent = connected.length ? money(data.totalUsdValue) : '—';
      document.querySelector('#updated').textContent = connected.length
        ? `${partial ? 'Partial total · ' : ''}Updated ${new Date(data.updatedAt).toLocaleString()}`
        : 'Add read-only exchange keys to get started';
      list.replaceChildren(...data.exchanges.map(renderExchange));
    } catch (cause) {
      error.textContent = cause.message;
      error.hidden = false;
    } finally {
      refreshButton.disabled = false;
      refreshButton.querySelector('span').textContent = 'Refresh';
    }
  }

  refreshButton.addEventListener('click', () => load(true));
  document.querySelector('#logout').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.assign('/');
  });
  load();
}
