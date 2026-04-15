import { useState, useEffect, useRef } from 'react';
import { CoinData, UpbitTicker } from '@/type/coin';

const COIN_NAMES: Record<string, string> = {
    'KRW-BTC': '비트코인',
    'KRW-ETH': '이더리움',
    'KRW-SOL': '솔라나',
    'KRW-XRP': '리플',
    'KRW-DOGE': '도지코인',
    'KRW-ADA': '에이다',
};

const COIN_LIST = Object.keys(COIN_NAMES);

export function useCoinMarket() {
    const [coins, setCoins] = useState<Record<string, CoinData>>({});
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // 초기 데이터 로딩 (익명일 때도 호출 가능)
        const fetchInitialPrices = async () => {
            try {
                const codes = COIN_LIST.join(',');
                const response = await fetch(`https://api.upbit.com/v1/ticker?markets=${codes}`);
                const data: UpbitTicker[] = await response.json();
                
                const initialData: Record<string, CoinData> = {};
                data.forEach(item => {
                    initialData[item.code] = {
                        symbol: item.code.split('-')[1],
                        name: COIN_NAMES[item.code],
                        price: item.trade_price,
                        changeRate: item.signed_change_rate * 100,
                        changeAmount: item.signed_change_price,
                        change: item.change
                    };
                });
                setCoins(initialData);
            } catch (error) {
                console.error('Failed to fetch initial coin prices:', error);
            }
        };

        fetchInitialPrices();

        // WebSocket 연결
        const connectWS = () => {
            ws.current = new WebSocket('wss://api.upbit.com/websocket/v1');
            ws.current.binaryType = 'blob';

            ws.current.onopen = () => {
                const payload = [
                    { ticket: 'test-ticket' },
                    { type: 'ticker', codes: COIN_LIST }
                ];
                ws.current?.send(JSON.stringify(payload));
            };

            ws.current.onmessage = async (event) => {
                const blob = event.data;
                const text = await blob.text();
                const data: UpbitTicker = JSON.parse(text);

                setCoins(prev => ({
                    ...prev,
                    [data.code]: {
                        symbol: data.code.split('-')[1],
                        name: COIN_NAMES[data.code],
                        price: data.trade_price,
                        changeRate: data.signed_change_rate * 100,
                        changeAmount: data.signed_change_price,
                        change: data.change
                    }
                }));
            };

            ws.current.onerror = () => {
                console.error('WebSocket error occurred');
            };

            ws.current.onclose = () => {
                console.log('WebSocket connection closed');
            };
        };

        connectWS();

        return () => {
            ws.current?.close();
        };
    }, []);

    // 정렬된 리스트 반환 (설정된 순서대로)
    const sortedCoins = COIN_LIST.map(code => coins[code]).filter(Boolean);

    return { coins: sortedCoins };
}
