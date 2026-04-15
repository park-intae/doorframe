export interface CoinData {
  symbol: string;      // 티커 (예: BTC)
  name: string;        // 이름 (예: 비트코인)
  price: number;       // 현재가
  changeRate: number;  // 변동률
  changeAmount: number; // 변동금액
  change: 'RISE' | 'FALL' | 'EVEN'; // 상승, 하락, 보합
}

export interface UpbitTicker {
  code: string;
  trade_price: number;
  signed_change_price: number;
  signed_change_rate: number;
  change: 'RISE' | 'FALL' | 'EVEN';
}
