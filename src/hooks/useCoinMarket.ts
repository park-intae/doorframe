import { useState, useEffect } from 'react';
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

// 공유 소켓 상태 관리
let sharedSocket: WebSocket | null = null;
const subscribers = new Set<(data: UpbitTicker) => void>();
let reconnectTimer: number | null = null;

const transformData = (data: UpbitTicker): CoinData => ({
    symbol: data.code.includes('-') ? data.code.split('-')[1] : data.code,
    name: COIN_NAMES[data.code] || '알 수 없음',
    price: data.trade_price,
    changeRate: data.signed_change_rate * 100,
    changeAmount: data.signed_change_price,
    change: data.change
});

const getSharedSocket = () => {
    if (sharedSocket && (sharedSocket.readyState === WebSocket.OPEN || sharedSocket.readyState === WebSocket.CONNECTING)) {
        return sharedSocket;
    }

    sharedSocket = new WebSocket('wss://api.upbit.com/websocket/v1');
    sharedSocket.binaryType = 'blob';
    
    sharedSocket.onopen = () => {
        if (reconnectTimer) {
            window.clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        sharedSocket?.send(JSON.stringify([
            { ticket: 'doorframe-ticket' },
            { type: 'ticker', codes: COIN_LIST }
        ]));
    };

    sharedSocket.onmessage = async (event) => {
        const text = await event.data.text();
        const data: UpbitTicker = JSON.parse(text);
        subscribers.forEach(cb => cb(data));
    };

    sharedSocket.onerror = (e) => console.error('Shared WebSocket error', e);
    sharedSocket.onclose = () => { 
        sharedSocket = null; 
        if (subscribers.size > 0) {
            reconnectTimer = window.setTimeout(() => {
                getSharedSocket();
            }, 3000);
        }
    };

    return sharedSocket;
};

export function useCoinMarket() {
    const [coins, setCoins] = useState<Record<string, CoinData>>({});

    useEffect(() => {
        // 초기 데이터 로딩
        const fetchInitialPrices = async () => {
            try {
                const response = await fetch(`https://api.upbit.com/v1/ticker?markets=${COIN_LIST.join(',')}`);
                const data: UpbitTicker[] = await response.json();
                const initialData: Record<string, CoinData> = {};
                data.forEach(item => { if (item.code) initialData[item.code] = transformData(item); });
                setCoins(initialData);
            } catch (e) { console.error('Failed to fetch initial coin prices:', e); }
        };

        fetchInitialPrices();

        // 구독자 추가 (쓰로틀링/배치 업데이트 적용)
        let pendingUpdates: Record<string, CoinData> = {};
        let rafId: number | null = null;

        const handler = (data: UpbitTicker) => {
            pendingUpdates[data.code] = transformData(data);
            if (rafId === null) {
                // 초당 약 3~4회 렌더링되도록 300ms 주기로 배치 업데이트
                rafId = window.setTimeout(() => {
                    setCoins(prev => ({ ...prev, ...pendingUpdates }));
                    pendingUpdates = {};
                    rafId = null;
                }, 300);
            }
        };
        subscribers.add(handler);
        getSharedSocket();

        return () => {
            subscribers.delete(handler);
            if (rafId !== null) window.clearTimeout(rafId);
        };
    }, []);

    return { coins: COIN_LIST.map(code => coins[code]).filter(Boolean) };
}
