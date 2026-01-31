import { NextResponse } from 'next/server';
import { fetchAllBalances } from '@/lib/exchanges';
import { PortfolioData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const exchanges = await fetchAllBalances();

    const totalUsdValue = exchanges.reduce(
      (sum, ex) => sum + ex.totalUsdValue,
      0
    );

    const portfolioData: PortfolioData = {
      exchanges,
      totalUsdValue,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(portfolioData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
