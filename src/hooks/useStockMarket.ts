import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/config/supabase';
import { StockData, StockMarketFilter, StockOption } from '@/type/stock';
import { chromeStorage } from '@/util/chromeStorage';

const SELECTED_STOCKS_KEY = 'doorframe_selected_stocks';
const MARKET_FILTER_KEY = 'doorframe_stock_market_filter';
const POLL_INTERVAL_MS = 20 * 1000;

export const DEFAULT_STOCK_OPTIONS: StockOption[] = [
    // 국내 주식 (KRX)
    { symbol: '005930.KS', name: '삼성전자', market: 'KR' },
    { symbol: '000660.KS', name: 'SK하이닉스', market: 'KR' },
    { symbol: '373220.KS', name: 'LG에너지솔루션', market: 'KR' },
    { symbol: '035420.KS', name: 'NAVER', market: 'KR' },
    { symbol: '005380.KS', name: '현대차', market: 'KR' },
    // 미국 주식 (US)
    { symbol: 'AAPL', name: '애플', market: 'US' },
    { symbol: 'NVDA', name: '엔비디아', market: 'US' },
    { symbol: 'TSLA', name: '테슬라', market: 'US' },
    { symbol: 'MSFT', name: '마이크로소프트', market: 'US' },
    { symbol: 'GOOGL', name: '알파벳 A', market: 'US' },
];

export const POPULAR_STOCK_OPTIONS: StockOption[] = [
    ...DEFAULT_STOCK_OPTIONS,
    { symbol: '035720.KS', name: '카카오', market: 'KR' },
    { symbol: '051910.KS', name: 'LG화학', market: 'KR' },
    { symbol: '207940.KS', name: '삼성바이오로직스', market: 'KR' },
    { symbol: '068270.KS', name: '셀트리온', market: 'KR' },
    { symbol: '247540.KQ', name: '에코프로비엠', market: 'KR' },
    { symbol: 'AMZN', name: '아마존', market: 'US' },
    { symbol: 'META', name: '메타', market: 'US' },
    { symbol: 'AMD', name: 'AMD', market: 'US' },
    { symbol: 'PLTR', name: '팔란티어', market: 'US' },
    { symbol: 'QQQ', name: 'Invesco QQQ', market: 'US' },
    { symbol: 'SPY', name: 'SPDR S&P 500', market: 'US' },
];

export function useStockMarket(enabled: boolean = true) {
    const [selectedStocks, setSelectedStocks] = useState<StockOption[]>(DEFAULT_STOCK_OPTIONS);
    const [marketFilter, setMarketFilterState] = useState<StockMarketFilter>('all');
    const [isLoadedStorage, setIsLoadedStorage] = useState(false);

    const [quotesMap, setQuotesMap] = useState<Record<string, StockData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    const [searchResults, setSearchResults] = useState<StockOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const isFetchingRef = useRef(false);

    // 저장된 종목 & 시장 필터 로드
    useEffect(() => {
        let mounted = true;
        Promise.all([
            chromeStorage.get<StockOption[]>(SELECTED_STOCKS_KEY),
            chromeStorage.get<StockMarketFilter>(MARKET_FILTER_KEY),
        ])
            .then(([savedStocks, savedFilter]) => {
                if (!mounted) return;
                if (Array.isArray(savedStocks) && savedStocks.length > 0) {
                    setSelectedStocks(savedStocks);
                }
                if (savedFilter === 'all' || savedFilter === 'kr' || savedFilter === 'us') {
                    setMarketFilterState(savedFilter);
                }
            })
            .catch((e) => console.error('Failed to load stock preferences:', e))
            .finally(() => {
                if (mounted) setIsLoadedStorage(true);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const filteredSelectedStocks = useMemo(() => {
        if (marketFilter === 'all') return selectedStocks;
        const target = marketFilter === 'kr' ? 'KR' : 'US';
        return selectedStocks.filter((s) => s.market === target);
    }, [selectedStocks, marketFilter]);

    const nameLookup = useMemo(() => {
        const map: Record<string, string> = {};
        POPULAR_STOCK_OPTIONS.forEach((s) => {
            map[s.symbol] = s.name;
        });
        selectedStocks.forEach((s) => {
            map[s.symbol] = s.name;
        });
        return map;
    }, [selectedStocks]);

    const fetchQuotes = useCallback(
        async (showLoading: boolean = false) => {
            const symbols = filteredSelectedStocks.map((s) => s.symbol);
            if (symbols.length === 0) {
                setQuotesMap({});
                return;
            }
            if (isFetchingRef.current) return;
            isFetchingRef.current = true;
            if (showLoading) setIsLoading(true);

            try {
                const { data, error: fnError } = await supabase.functions.invoke('stock', {
                    body: { action: 'quotes', symbols },
                });

                if (fnError) throw fnError;
                const quotes: StockData[] = Array.isArray(data?.quotes) ? data.quotes : [];

                setQuotesMap((prev) => {
                    const next = { ...prev };
                    quotes.forEach((q) => {
                        next[q.symbol] = {
                            ...q,
                            name: nameLookup[q.symbol] || q.name,
                        };
                    });
                    return next;
                });
                setError(null);
                setLastUpdated(data?.updatedAt || Date.now());
            } catch (err) {
                console.error('Failed to fetch stock quotes:', err);
                setError('주식 시세를 불러오지 못했습니다.');
            } finally {
                isFetchingRef.current = false;
                if (showLoading) setIsLoading(false);
            }
        },
        [filteredSelectedStocks, nameLookup]
    );

    // 주기적 폴링 (20초 간격, 탭 비활성화 시 일시 중지)
    useEffect(() => {
        if (!isLoadedStorage || !enabled) return;

        fetchQuotes(Object.keys(quotesMap).length === 0);

        const intervalId = window.setInterval(() => {
            if (!document.hidden) {
                fetchQuotes(false);
            }
        }, POLL_INTERVAL_MS);

        const handleVisibility = () => {
            if (!document.hidden) {
                fetchQuotes(false);
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoadedStorage, enabled, fetchQuotes]);

    const setMarketFilter = useCallback((filter: StockMarketFilter) => {
        setMarketFilterState(filter);
        chromeStorage.set(MARKET_FILTER_KEY, filter).catch((e) =>
            console.error('Failed to save stock market filter:', e)
        );
    }, []);

    const updateSelectedStocks = useCallback((updater: (prev: StockOption[]) => StockOption[]) => {
        setSelectedStocks((prev) => {
            const next = updater(prev);
            chromeStorage.set(SELECTED_STOCKS_KEY, next).catch((e) =>
                console.error('Failed to save selected stocks:', e)
            );
            return next;
        });
    }, []);

    const toggleStock = useCallback(
        (option: StockOption) => {
            updateSelectedStocks((prev) => {
                const exists = prev.some((s) => s.symbol === option.symbol);
                return exists
                    ? prev.filter((s) => s.symbol !== option.symbol)
                    : [...prev, option];
            });
        },
        [updateSelectedStocks]
    );

    const resetStocks = useCallback(() => {
        updateSelectedStocks(() => [...DEFAULT_STOCK_OPTIONS]);
    }, [updateSelectedStocks]);

    const searchStocks = useCallback(async (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const { data, error: fnError } = await supabase.functions.invoke('stock', {
                body: { action: 'search', query: trimmed },
            });
            if (fnError) throw fnError;
            setSearchResults(Array.isArray(data?.results) ? data.results : []);
        } catch (err) {
            console.error('Failed to search stocks:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const stocks = useMemo(
        () => filteredSelectedStocks.map((s) => quotesMap[s.symbol]).filter(Boolean),
        [filteredSelectedStocks, quotesMap]
    );

    return {
        stocks,
        selectedStocks,
        filteredSelectedStocks,
        marketFilter,
        setMarketFilter,
        toggleStock,
        resetStocks,
        searchStocks,
        searchResults,
        isSearching,
        isLoading,
        error,
        lastUpdated,
        refresh: () => fetchQuotes(true),
    };
}
