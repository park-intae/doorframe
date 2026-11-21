export interface CoinData {
  code?: string;       // 마켓 코드 (예: KRW-BTC)
  symbol: string;      // 티커 (예: BTC)
  name: string;        // 이름 (예: 비트코인)
  price: number;       // 현재가
  changeRate: number;  // 변동률
  changeAmount: number; // 변동금액
  change: 'RISE' | 'FALL' | 'EVEN'; // 상승, 하락, 보합
}

export interface UpbitTicker {
  code?: string;
  market?: string;
  trade_price: number;
  signed_change_price: number;
  signed_change_rate: number;
  change: 'RISE' | 'FALL' | 'EVEN';
}

export interface UpbitMarketInfo {
  market: string;
  korean_name: string;
  english_name: string;
}

export interface CoinMarketOption {
  code: string;
  symbol: string;
  koreanName: string;
  englishName: string;
}
