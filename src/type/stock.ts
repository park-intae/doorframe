export type StockMarket = 'KR' | 'US';
export type StockMarketFilter = 'all' | 'kr' | 'us';

export interface StockOption {
  symbol: string;
  name: string;
  market: StockMarket;
  exchange?: string;
}

export interface StockData {
  symbol: string;
  name: string;
  market: StockMarket;
  currency: string;
  price: number;
  previousClose: number;
  changeAmount: number;
  changeRate: number;
  change: 'RISE' | 'FALL' | 'EVEN';
  marketState: string;
}
