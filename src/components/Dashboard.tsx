'use client';

import { useQuery } from '@tanstack/react-query';
import { PortfolioData } from '@/lib/types';
import { LoadingSpinner } from './LoadingSpinner';
import { PortfolioSummary } from './PortfolioSummary';
import { ExchangeCard } from './ExchangeCard';

async function fetchPortfolio(): Promise<PortfolioData> {
  const response = await fetch('/api/portfolio');
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio');
  }
  return response.json();
}

export function Dashboard() {
  const {
    data: portfolio,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
    refetchOnWindowFocus: false,
    staleTime: 60000, // Consider data stale after 1 minute
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-red-800">Error Loading Portfolio</h2>
          <p className="text-red-600 mt-2">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CEX Portfolio Tracker</h1>
          <p className="text-gray-600 mt-1">Track your Binance, KuCoin, and Gate.io holdings</p>
        </header>

        <div className="space-y-6">
          <PortfolioSummary
            totalUsdValue={portfolio.totalUsdValue}
            lastUpdated={portfolio.lastUpdated}
            onRefresh={() => refetch()}
            isLoading={isFetching}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {portfolio.exchanges.map((exchange) => (
              <ExchangeCard key={exchange.exchange} exchange={exchange} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
