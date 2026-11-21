import { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, Check, RotateCcw, RefreshCw, Search, X } from 'lucide-react';
import { useCoinMarket } from '@/hooks/useCoinMarket';
import { useStockMarket, POPULAR_STOCK_OPTIONS } from '@/hooks/useStockMarket';
import { StockMarketFilter, StockOption } from '@/type/stock';
import { chromeStorage } from '@/util/chromeStorage';
import CoinListItem from '../coin/CoinListItem';
import StockListItem from '../stock/StockListItem';

type MarketTab = 'coin' | 'stock';

const MARKET_TAB_STORAGE_KEY = 'doorframe_market_active_tab';

const STOCK_FILTER_LABELS: { value: StockMarketFilter; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'kr', label: '국장' },
    { value: 'us', label: '미장' },
];

export default function MarketBoard() {
    const [activeTab, setActiveTab] = useState<MarketTab>('coin');
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        chromeStorage
            .get<MarketTab>(MARKET_TAB_STORAGE_KEY)
            .then((saved) => {
                if (saved === 'coin' || saved === 'stock') {
                    setActiveTab(saved);
                }
            })
            .catch(() => {});
    }, []);

    const handleTabChange = (tab: MarketTab) => {
        setActiveTab(tab);
        setIsEditing(false);
        setSearchQuery('');
        chromeStorage.set(MARKET_TAB_STORAGE_KEY, tab).catch(() => {});
    };

    const {
        coins,
        selectedCodes,
        allMarkets,
        toggleCoin,
        resetCoins,
    } = useCoinMarket(activeTab === 'coin');

    const {
        stocks,
        selectedStocks,
        marketFilter,
        setMarketFilter,
        toggleStock,
        resetStocks,
        searchStocks,
        searchResults,
        isSearching,
        isLoading: isStockLoading,
        error: stockError,
        lastUpdated,
        refresh: refreshStocks,
    } = useStockMarket(activeTab === 'stock');

    // 주식 검색 디바운스
    useEffect(() => {
        if (activeTab !== 'stock' || !isEditing) return;
        const timer = window.setTimeout(() => {
            searchStocks(searchQuery);
        }, 300);
        return () => window.clearTimeout(timer);
    }, [searchQuery, activeTab, isEditing, searchStocks]);

    // 코인 편집 목록 필터링 (선택된 코인 우선 + 검색어 매칭)
    const filteredCoinOptions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const selectedSet = new Set(selectedCodes);

        const matched = allMarkets.filter((m) => {
            if (!q) return true;
            return (
                m.koreanName.toLowerCase().includes(q) ||
                m.englishName.toLowerCase().includes(q) ||
                m.symbol.toLowerCase().includes(q)
            );
        });

        // 검색어가 없을 때는 선택된 코인을 상단에 정렬
        if (!q) {
            return [...matched].sort((a, b) => {
                const aSel = selectedSet.has(a.code) ? 0 : 1;
                const bSel = selectedSet.has(b.code) ? 0 : 1;
                return aSel - bSel;
            });
        }
        return matched.slice(0, 40);
    }, [allMarkets, searchQuery, selectedCodes]);

    // 주식 편집 목록 (검색어가 있으면 검색 결과 + 선택된 항목, 없으면 인기 프리셋 + 사용자 추가 항목)
    const stockEditOptions = useMemo(() => {
        const merged = new Map<string, StockOption>();
        const source = searchQuery.trim()
            ? searchResults
            : [...selectedStocks, ...POPULAR_STOCK_OPTIONS];

        source.forEach((item) => {
            if (marketFilter === 'kr' && item.market !== 'KR') return;
            if (marketFilter === 'us' && item.market !== 'US') return;
            if (!merged.has(item.symbol)) {
                merged.set(item.symbol, item);
            }
        });
        return Array.from(merged.values());
    }, [searchQuery, searchResults, selectedStocks, marketFilter]);

    const handleTableWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
    };

    const formatUpdatedTime = (ts: number | null) => {
        if (!ts) return '';
        return new Date(ts).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    return (
        <div className="flex flex-col w-full p-4.5 glass font-paperlogy overflow-hidden h-full">
            {/* 상단 타이틀 + 코인/주식 탭 + 편집 버튼 */}
            <div className="flex items-center justify-between gap-2 mb-2.5 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-6 bg-point rounded-full" />
                    <div className="flex items-center bg-black/10 dark:bg-white/10 rounded-xl p-0.5">
                        <button
                            type="button"
                            onClick={() => handleTabChange('coin')}
                            className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                                activeTab === 'coin'
                                    ? 'bg-point text-white shadow-sm'
                                    : 'text-context hover:text-title'
                            }`}
                        >
                            코인
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('stock')}
                            className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                                activeTab === 'stock'
                                    ? 'bg-point text-white shadow-sm'
                                    : 'text-context hover:text-title'
                            }`}
                        >
                            주식
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {activeTab === 'stock' && !isEditing && (
                        <button
                            type="button"
                            onClick={refreshStocks}
                            title="새로고침"
                            aria-label="주식 시세 새로고침"
                            className="p-1.5 rounded-lg text-context hover:text-title hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <RefreshCw className={`w-4 h-4 ${isStockLoading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing((prev) => !prev);
                            setSearchQuery('');
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            isEditing
                                ? 'bg-point text-white'
                                : 'bg-black/10 dark:bg-white/10 text-context hover:text-title'
                        }`}
                    >
                        {isEditing ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                완료
                            </>
                        ) : (
                            <>
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                종목 편집
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 주식 시장 필터 (전체 / 국장 / 미장) */}
            {activeTab === 'stock' && (
                <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                        {STOCK_FILTER_LABELS.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setMarketFilter(item.value)}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                                    marketFilter === item.value
                                        ? 'bg-title text-background'
                                        : 'bg-black/5 dark:bg-white/10 text-context hover:text-title'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={resetStocks}
                            className="flex items-center gap-1 text-[11px] text-context hover:text-title cursor-pointer"
                        >
                            <RotateCcw className="w-3 h-3" />
                            기본값
                        </button>
                    )}
                </div>
            )}

            {/* 코인 편집 상단 바 */}
            {activeTab === 'coin' && isEditing && (
                <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0">
                    <span className="text-xs text-context">
                        선택됨: <strong className="text-title">{selectedCodes.length}개</strong>
                    </span>
                    <button
                        type="button"
                        onClick={resetCoins}
                        className="flex items-center gap-1 text-[11px] text-context hover:text-title cursor-pointer"
                    >
                        <RotateCcw className="w-3 h-3" />
                        기본값
                    </button>
                </div>
            )}

            {/* 편집 모드 검색창 */}
            {isEditing && (
                <div className="relative mb-2 flex-shrink-0">
                    <Search className="w-3.5 h-3.5 text-context/60 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                            activeTab === 'coin'
                                ? '코인명 또는 티커 검색 (예: 비트, SOL)'
                                : '종목명 또는 티커 검색 (예: 삼성전자, NVDA)'
                        }
                        className="w-full pl-8 pr-8 py-1.5 rounded-xl text-xs bg-black/5 dark:bg-white/10 text-title placeholder:text-context/50 focus:outline-none focus:ring-1 focus:ring-point"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-context/60 hover:text-title cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* 메인 콘텐츠 영역 */}
            <div className="w-full flex-1 min-h-0 overflow-hidden flex flex-col">
                {!isEditing && (
                    <div className="grid grid-cols-5 gap-2 pb-2 mb-2 border-b border-black/50 dark:border-white/20 text-sm font-bold text-context flex-shrink-0">
                        <div className="col-span-2">{activeTab === 'coin' ? '코인명' : '종목명'}</div>
                        <div className="text-right">현재가</div>
                        <div className="text-right">전일대비</div>
                        <div className="text-right">변동액</div>
                    </div>
                )}

                <div
                    className="flex-1 overflow-y-auto pr-2 scrollbar-thin glass-sub p-4"
                    onWheel={handleTableWheel}
                >
                    {isEditing ? (
                        activeTab === 'coin' ? (
                            <div className="flex flex-col gap-1.5">
                                {filteredCoinOptions.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-context/60">
                                        검색 결과가 없습니다.
                                    </div>
                                ) : (
                                    filteredCoinOptions.map((option) => {
                                        const selected = selectedCodes.includes(option.code);
                                        return (
                                            <button
                                                key={option.code}
                                                type="button"
                                                onClick={() => toggleCoin(option.code)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                                                    selected
                                                        ? 'bg-point/15 border border-point/40'
                                                        : 'hover:bg-white/10 border border-transparent'
                                                }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-title">
                                                        {option.koreanName}
                                                    </span>
                                                    <span className="text-[11px] text-context/60">
                                                        {option.symbol}/KRW · {option.englishName}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                                        selected
                                                            ? 'bg-point text-white'
                                                            : 'border border-context/30'
                                                    }`}
                                                >
                                                    {selected && <Check className="w-3 h-3" />}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {isSearching ? (
                                    <div className="py-8 text-center text-xs text-context/60">
                                        종목을 검색하는 중...
                                    </div>
                                ) : stockEditOptions.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-context/60">
                                        {searchQuery.trim()
                                            ? '검색 결과가 없습니다.'
                                            : '표시할 종목이 없습니다.'}
                                    </div>
                                ) : (
                                    stockEditOptions.map((option) => {
                                        const selected = selectedStocks.some(
                                            (s) => s.symbol === option.symbol
                                        );
                                        return (
                                            <button
                                                key={option.symbol}
                                                type="button"
                                                onClick={() => toggleStock(option)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                                                    selected
                                                        ? 'bg-point/15 border border-point/40'
                                                        : 'hover:bg-white/10 border border-transparent'
                                                }`}
                                            >
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <span className="text-sm font-bold text-title truncate">
                                                        {option.name}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] px-1.5 rounded bg-black/10 dark:bg-white/10 text-context/80">
                                                            {option.market === 'KR' ? '국장' : '미장'}
                                                        </span>
                                                        <span className="text-[11px] text-context/60">
                                                            {option.symbol}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                                                        selected
                                                            ? 'bg-point text-white'
                                                            : 'border border-context/30'
                                                    }`}
                                                >
                                                    {selected && <Check className="w-3 h-3" />}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )
                    ) : activeTab === 'coin' ? (
                        <div className="flex flex-col gap-1">
                            {selectedCodes.length === 0 ? (
                                <div className="flex items-center justify-center py-10 text-context/50 text-sm">
                                    선택된 코인이 없습니다. 종목 편집에서 추가해주세요.
                                </div>
                            ) : coins.length === 0 ? (
                                <div className="flex items-center justify-center py-10 text-context/50">
                                    데이터를 불러오는 중...
                                </div>
                            ) : (
                                coins.map((coin) => <CoinListItem key={coin.symbol} coin={coin} />)
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {stockError && stocks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-10 text-context/60 text-sm">
                                    <span>{stockError}</span>
                                    <button
                                        type="button"
                                        onClick={refreshStocks}
                                        className="px-3 py-1 rounded-lg bg-point text-white text-xs font-bold cursor-pointer"
                                    >
                                        다시 시도
                                    </button>
                                </div>
                            ) : stocks.length === 0 ? (
                                <div className="flex items-center justify-center py-10 text-context/50 text-sm">
                                    {isStockLoading
                                        ? '주식 시세를 불러오는 중...'
                                        : '선택된 종목이 없습니다. 종목 편집에서 추가해주세요.'}
                                </div>
                            ) : (
                                stocks.map((stock) => (
                                    <StockListItem key={stock.symbol} stock={stock} />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 하단 상태 바 */}
            <div className="mt-2 text-[10px] text-context/40 flex justify-between items-center flex-shrink-0">
                {activeTab === 'coin' ? (
                    <>
                        <span>Data provided by Upbit</span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Live Connection
                        </span>
                    </>
                ) : (
                    <>
                        <span>Data provided by Yahoo Finance</span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            {lastUpdated ? `20s Polling · ${formatUpdatedTime(lastUpdated)}` : '20s Polling'}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
