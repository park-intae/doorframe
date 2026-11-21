import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CoinData, CoinMarketOption, UpbitMarketInfo, UpbitTicker } from '@/type/coin';
import { chromeStorage } from '@/util/chromeStorage';

const STORAGE_KEY = 'doorframe_selected_coins';

export const DEFAULT_COIN_CODES = [
    'KRW-BTC',
    'KRW-ETH',
    'KRW-XRP',
    'KRW-SOL',
    'KRW-DOGE',
    'KRW-ADA',
    'KRW-AVAX',
    'KRW-LINK',
    'KRW-SUI',
    'KRW-TRX',
];

const FALLBACK_COIN_NAMES: Record<string, string> = {
    'KRW-BTC': '비트코인',
    'KRW-ETH': '이더리움',
    'KRW-XRP': '리플',
    'KRW-SOL': '솔라나',
    'KRW-DOGE': '도지코인',
    'KRW-ADA': '에이다',
    'KRW-AVAX': '아발란체',
    'KRW-LINK': '체인링크',
    'KRW-SUI': '수이',
    'KRW-TRX': '트론',
};

// 공유 소켓, 캐시 및 마켓 카탈로그 상태 관리
let sharedSocket: WebSocket | null = null;
const subscribers = new Set<(data: UpbitTicker) => void>();
let reconnectTimer: number | null = null;
let activeCodes: string[] = [...DEFAULT_COIN_CODES];
let cachedSelectedCodes: string[] | null = null;
let cachedCoins: Record<string, CoinData> = {};
let cachedMarkets: CoinMarketOption[] | null = null;
let marketsFetchPromise: Promise<CoinMarketOption[]> | null = null;

const getTickerCode = (data: UpbitTicker): string => data.code || data.market || '';

const getCoinName = (code: string, nameMap: Record<string, string>) =>
    nameMap[code] || FALLBACK_COIN_NAMES[code] || (code.includes('-') ? code.split('-')[1] : code);

const transformData = (data: UpbitTicker, nameMap: Record<string, string>): CoinData => {
    const code = getTickerCode(data);
    return {
        code,
        symbol: code.includes('-') ? code.split('-')[1] : code,
        name: getCoinName(code, nameMap),
        price: data.trade_price,
        changeRate: data.signed_change_rate * 100,
        changeAmount: data.signed_change_price,
        change: data.change,
    };
};

const sendSubscription = (codes: string[]) => {
    if (!sharedSocket || sharedSocket.readyState !== WebSocket.OPEN || codes.length === 0) {
        return;
    }
    sharedSocket.send(
        JSON.stringify([
            { ticket: 'doorframe-ticket' },
            { type: 'ticker', codes },
        ])
    );
};

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
        sendSubscription(activeCodes);
    };

    sharedSocket.onmessage = async (event) => {
        try {
            const text = typeof event.data === 'string' ? event.data : await event.data.text();
            const data: UpbitTicker = JSON.parse(text);
            subscribers.forEach((cb) => cb(data));
        } catch (e) {
            console.error('Failed to parse Upbit WebSocket message:', e);
        }
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

async function loadAllUpbitMarkets(): Promise<CoinMarketOption[]> {
    if (cachedMarkets) return cachedMarkets;
    if (marketsFetchPromise) return marketsFetchPromise;

    marketsFetchPromise = fetch('https://api.upbit.com/v1/market/all?is_details=false')
        .then((res) => {
            if (!res.ok) throw new Error(`Upbit market list fetch failed: ${res.status}`);
            return res.json() as Promise<UpbitMarketInfo[]>;
        })
        .then((list) => {
            const krwMarkets = list
                .filter((item) => item.market.startsWith('KRW-'))
                .map((item) => ({
                    code: item.market,
                    symbol: item.market.split('-')[1],
                    koreanName: item.korean_name,
                    englishName: item.english_name,
                }));
            cachedMarkets = krwMarkets;
            return krwMarkets;
        })
        .catch((err) => {
            console.error('Failed to fetch Upbit market list:', err);
            marketsFetchPromise = null;
            return [];
        });

    return marketsFetchPromise;
}

export function useCoinMarket(enabled: boolean = true) {
    const [selectedCodes, setSelectedCodes] = useState<string[]>(
        () => cachedSelectedCodes ?? DEFAULT_COIN_CODES
    );
    const [isLoadedStorage, setIsLoadedStorage] = useState(() => cachedSelectedCodes !== null);
    const [allMarkets, setAllMarkets] = useState<CoinMarketOption[]>(() => cachedMarkets ?? []);
    const [coins, setCoins] = useState<Record<string, CoinData>>(() => cachedCoins);

    // 마켓 코드 -> 한글명 매핑
    const nameMap = useMemo(() => {
        const map: Record<string, string> = { ...FALLBACK_COIN_NAMES };
        allMarkets.forEach((m) => {
            map[m.code] = m.koreanName;
        });
        return map;
    }, [allMarkets]);

    const nameMapRef = useRef(nameMap);
    nameMapRef.current = nameMap;

    // 저장된 코인 목록 로드 & 전체 마켓 목록 로드
    useEffect(() => {
        let mounted = true;
        if (cachedSelectedCodes === null) {
            chromeStorage
                .get<string[]>(STORAGE_KEY)
                .then((saved) => {
                    if (!mounted) return;
                    const resolved =
                        Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_COIN_CODES;
                    cachedSelectedCodes = resolved;
                    setSelectedCodes(resolved);
                })
                .catch((e) => console.error('Failed to load saved coins:', e))
                .finally(() => {
                    if (mounted) setIsLoadedStorage(true);
                });
        }

        if (!cachedMarkets) {
            loadAllUpbitMarkets().then((markets) => {
                if (mounted && markets.length > 0) {
                    setAllMarkets(markets);
                }
            });
        }

        return () => {
            mounted = false;
        };
    }, []);

    // 선택된 코인 목록에 맞춰 초기 시세 로드 & 웹소켓 구독
    useEffect(() => {
        if (!isLoadedStorage || !enabled) return;

        activeCodes = selectedCodes;

        if (selectedCodes.length === 0) {
            cachedCoins = {};
            setCoins({});
            return;
        }

        let cancelled = false;

        const fetchInitialPrices = async () => {
            try {
                const response = await fetch(
                    `https://api.upbit.com/v1/ticker?markets=${selectedCodes.join(',')}`
                );
                if (!response.ok) return;
                const data: UpbitTicker[] = await response.json();
                if (cancelled) return;
                const initialData: Record<string, CoinData> = {};
                data.forEach((item) => {
                    const code = getTickerCode(item);
                    if (code) initialData[code] = transformData(item, nameMapRef.current);
                });
                cachedCoins = { ...cachedCoins, ...initialData };
                setCoins((prev) => ({ ...prev, ...initialData }));
            } catch (e) {
                console.error('Failed to fetch initial coin prices:', e);
            }
        };

        fetchInitialPrices();

        let pendingUpdates: Record<string, CoinData> = {};
        let rafId: number | null = null;

        const handler = (data: UpbitTicker) => {
            const code = getTickerCode(data);
            if (!code || !activeCodes.includes(code)) return;
            pendingUpdates[code] = transformData(data, nameMapRef.current);
            if (rafId === null) {
                // 초당 약 3~4회 렌더링되도록 300ms 주기로 배치 업데이트
                rafId = window.setTimeout(() => {
                    const batch = pendingUpdates;
                    pendingUpdates = {};
                    rafId = null;
                    cachedCoins = { ...cachedCoins, ...batch };
                    setCoins((prev) => ({ ...prev, ...batch }));
                }, 300);
            }
        };

        subscribers.add(handler);
        const socket = getSharedSocket();
        if (socket.readyState === WebSocket.OPEN) {
            sendSubscription(selectedCodes);
        }

        return () => {
            cancelled = true;
            subscribers.delete(handler);
            if (rafId !== null) window.clearTimeout(rafId);
        };
    }, [selectedCodes, isLoadedStorage, enabled]);

    const updateSelectedCodes = useCallback((updater: (prev: string[]) => string[]) => {
        setSelectedCodes((prev) => {
            const next = updater(prev);
            cachedSelectedCodes = next;
            chromeStorage.set(STORAGE_KEY, next).catch((e) =>
                console.error('Failed to save selected coins:', e)
            );
            return next;
        });
    }, []);

    const toggleCoin = useCallback(
        (code: string) => {
            updateSelectedCodes((prev) =>
                prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
            );
        },
        [updateSelectedCodes]
    );

    const resetCoins = useCallback(() => {
        updateSelectedCodes(() => [...DEFAULT_COIN_CODES]);
    }, [updateSelectedCodes]);

    return {
        coins: selectedCodes.map((code) => coins[code]).filter(Boolean),
        selectedCodes,
        allMarkets,
        toggleCoin,
        resetCoins,
    };
}
