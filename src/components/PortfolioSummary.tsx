'use client';

interface PortfolioSummaryProps {
  totalUsdValue: number;
  lastUpdated: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export function PortfolioSummary({
  totalUsdValue,
  lastUpdated,
  onRefresh,
  isLoading,
}: PortfolioSummaryProps) {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalUsdValue);

  const formattedDate = new Date(lastUpdated).toLocaleString();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-blue-100 text-sm font-medium">Total Portfolio Value</p>
          <p className="text-4xl font-bold mt-1">{formattedValue}</p>
          <p className="text-blue-200 text-xs mt-2">
            Last updated: {formattedDate}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-white/20 hover:bg-white/30 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}
