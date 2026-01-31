export type ExchangeName = 'binance' | 'kucoin' | 'gateio';

export type AccountType = 'spot' | 'earn' | 'margin' | 'futures';

export interface Asset {
  symbol: string;
  amount: number;
  usdValue: number;
  price: number;
  accountType?: AccountType;
}

export interface ExchangeBalance {
  exchange: ExchangeName;
  displayName: string;
  assets: Asset[];
  totalUsdValue: number;
  error?: string;
}

export interface PortfolioData {
  exchanges: ExchangeBalance[];
  totalUsdValue: number;
  lastUpdated: string;
}

export interface ExchangeConfig {
  name: ExchangeName;
  displayName: string;
  apiKey: string | undefined;
  secret: string | undefined;
  password?: string | undefined; // KuCoin passphrase
}
