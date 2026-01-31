#!/usr/bin/env node

import { fetchAllBalances } from './lib/exchanges.js';
import { ExchangeBalance, ExchangeName } from './lib/types.js';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  if (value < 0.01 && value > 0) {
    return value.toExponential(4);
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

function printExchangeBalance(exchange: ExchangeBalance): void {
  console.log(`\n## ${exchange.displayName}`);

  if (exchange.error) {
    console.log(`❌ Error: ${exchange.error}`);
    return;
  }

  if (exchange.assets.length === 0) {
    console.log('No assets found');
    return;
  }

  console.log(`**Total Value:** ${formatCurrency(exchange.totalUsdValue)}\n`);

  // Group by account type
  const spotAssets = exchange.assets.filter(a => a.accountType === 'spot');
  const earnAssets = exchange.assets.filter(a => a.accountType === 'earn');

  if (spotAssets.length > 0) {
    console.log('### Spot Account');
    console.log('| Asset | Amount | Price | USD Value |');
    console.log('|-------|--------|-------|-----------|');
    for (const asset of spotAssets) {
      console.log(
        `| ${asset.symbol.padEnd(6)} | ${formatNumber(asset.amount).padEnd(14)} | ${formatCurrency(asset.price).padEnd(10)} | ${formatCurrency(asset.usdValue)} |`
      );
    }
    console.log('');
  }

  if (earnAssets.length > 0) {
    console.log('### Earn/Savings Account');
    console.log('| Asset | Amount | Price | USD Value |');
    console.log('|-------|--------|-------|-----------|');
    for (const asset of earnAssets) {
      console.log(
        `| ${asset.symbol.padEnd(6)} | ${formatNumber(asset.amount).padEnd(14)} | ${formatCurrency(asset.price).padEnd(10)} | ${formatCurrency(asset.usdValue)} |`
      );
    }
    console.log('');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const filterExchange = args[0]?.toLowerCase() as ExchangeName | undefined;
  const summaryOnly = args.includes('--summary');

  console.log('# CEX Portfolio Balances\n');
  console.log('Fetching balances from configured exchanges...\n');

  try {
    const balances = await fetchAllBalances();

    // Filter if exchange specified
    const filteredBalances = filterExchange
      ? balances.filter(b => b.exchange === filterExchange)
      : balances;

    if (filteredBalances.length === 0) {
      console.log('❌ No exchanges configured or no balances found.');
      console.log('\nMake sure you have set up API keys in your environment variables:');
      console.log('- BINANCE_API_KEY, BINANCE_SECRET');
      console.log('- KUCOIN_API_KEY, KUCOIN_SECRET, KUCOIN_PASSPHRASE');
      console.log('- GATE_API_KEY, GATE_SECRET');
      process.exit(1);
    }

    const totalValue = filteredBalances.reduce(
      (sum, ex) => sum + ex.totalUsdValue,
      0
    );

    if (summaryOnly) {
      console.log('## Portfolio Summary\n');
      for (const exchange of filteredBalances) {
        const status = exchange.error ? '❌' : '✅';
        console.log(`${status} **${exchange.displayName}**: ${formatCurrency(exchange.totalUsdValue)}`);
      }
      console.log(`\n**Total Portfolio Value:** ${formatCurrency(totalValue)}`);
    } else {
      for (const exchange of filteredBalances) {
        printExchangeBalance(exchange);
      }
      console.log('---');
      console.log(`\n**Total Portfolio Value:** ${formatCurrency(totalValue)}`);
    }

    console.log(`\n*Last updated: ${new Date().toLocaleString()}*`);
  } catch (error) {
    console.error('❌ Error fetching balances:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
