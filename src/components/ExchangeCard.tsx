'use client';

import { ExchangeBalance } from '@/lib/types';
import { AssetTable } from './AssetTable';

interface ExchangeCardProps {
  exchange: ExchangeBalance;
}

const exchangeColors: Record<string, string> = {
  binance: 'from-yellow-400 to-yellow-600',
  kucoin: 'from-green-400 to-green-600',
  gateio: 'from-blue-400 to-blue-600',
};

export function ExchangeCard({ exchange }: ExchangeCardProps) {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(exchange.totalUsdValue);

  const colorClass = exchangeColors[exchange.exchange] || 'from-gray-400 to-gray-600';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClass} p-4`}>
        <div className="flex justify-between items-center text-white">
          <h3 className="text-lg font-semibold">{exchange.displayName}</h3>
          <span className="text-xl font-bold">{formattedValue}</span>
        </div>
      </div>

      <div className="p-4">
        {exchange.error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{exchange.error}</p>
          </div>
        ) : (
          <AssetTable assets={exchange.assets} />
        )}
      </div>
    </div>
  );
}
