'use client';

import { Asset } from '@/lib/types';

interface AssetTableProps {
  assets: Asset[];
}

export function AssetTable({ assets }: AssetTableProps) {
  if (assets.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-4">No assets found</p>
    );
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num < 0.01 && num > 0) {
      return num.toFixed(6);
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatUsd = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="pb-2 font-medium">Asset</th>
            <th className="pb-2 font-medium text-right">Amount</th>
            <th className="pb-2 font-medium text-right">Price</th>
            <th className="pb-2 font-medium text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, index) => (
            <tr
              key={`${asset.symbol}-${asset.accountType || 'spot'}-${index}`}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-3">
                <span className="font-medium text-gray-900">{asset.symbol}</span>
                {asset.accountType && asset.accountType !== 'spot' && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-purple-100 text-purple-700 font-medium">
                    {asset.accountType.charAt(0).toUpperCase() + asset.accountType.slice(1)}
                  </span>
                )}
              </td>
              <td className="py-3 text-right text-gray-600">
                {formatNumber(asset.amount, asset.amount < 1 ? 6 : 4)}
              </td>
              <td className="py-3 text-right text-gray-600">
                {asset.price > 0 ? formatUsd(asset.price) : '-'}
              </td>
              <td className="py-3 text-right font-medium text-gray-900">
                {formatUsd(asset.usdValue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
