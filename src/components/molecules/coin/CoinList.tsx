import { useCoinMarket } from "@/hooks/useCoinMarket";

export default function CoinList() {
    const { coins } = useCoinMarket();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR').format(price);
    };

    const formatChange = (amount: number) => {
        const sign = amount > 0 ? '+' : '';
        return `${sign}${new Intl.NumberFormat('ko-KR').format(amount)}`;
    };

    const formatRate = (rate: number) => {
        const sign = rate > 0 ? '+' : '';
        return `${sign}${rate.toFixed(2)}%`;
    };

    const getChangeColor = (change: 'RISE' | 'FALL' | 'EVEN') => {
        if (change === 'RISE') return 'text-red-500';
        if (change === 'FALL') return 'text-blue-500';
        return 'text-context';
    };

    // 테이블 내부 휠 이벤트 전파 방지 (캐러셀 이동 막기)
    const handleTableWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="flex flex-col w-full max-w-140 mx-auto p-6 glass font-paperlogy overflow-hidden h-60 lgDT:h-100">
            <h2 className="text-xl font-bold text-title mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-point rounded-full" />
                실시간 코인 시세 (KRW)
            </h2>
            
            <div className="w-full flex-1 overflow-hidden flex flex-col">
                {/* 헤더 */}
                <div className="grid grid-cols-5 gap-2 pb-2 mb-2 border-b border-white/20 text-sm font-bold text-context">
                    <div className="col-span-2">코인명</div>
                    <div className="text-right">현재가</div>
                    <div className="text-right">전일대비</div>
                    <div className="text-right">변동액</div>
                </div>

                {/* 데이터 리스트 (스크롤 가능 영역) */}
                <div 
                    className="flex-1 overflow-y-auto pr-2 scrollbar-thin bg-white/25 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-[inset_0_1px_6px_rgba(0,0,0,0.03)]"
                    onWheel={handleTableWheel}
                >
                    <div className="flex flex-col gap-1">
                        {coins.length === 0 ? (
                            <div className="flex items-center justify-center py-10 text-context/50">
                                데이터를 불러오는 중...
                            </div>
                        ) : (
                            coins.map((coin) => (
                                <div 
                                    key={coin.symbol}
                                    className="grid grid-cols-5 gap-2 py-3 border-b border-white/5 hover:bg-white/5 transition-colors items-center"
                                >
                                    <div className="col-span-2 flex flex-col">
                                        <span className="text-title font-bold text-base leading-tight">
                                            {coin.name}
                                        </span>
                                        <span className="text-xs text-context/60">
                                            {coin.symbol}/KRW
                                        </span>
                                    </div>
                                    <div className="text-right font-bold text-title whitespace-nowrap">
                                        {formatPrice(coin.price)}
                                    </div>
                                    <div className={`text-right font-bold whitespace-nowrap ${getChangeColor(coin.change)}`}>
                                        {formatRate(coin.changeRate)}
                                    </div>
                                    <div className={`text-right text-xs whitespace-nowrap ${getChangeColor(coin.change)}`}>
                                        {formatChange(coin.changeAmount)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 text-[10px] text-context/40 flex justify-between items-center">
                <span>Data provided by Upbit</span>
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live Connection
                </span>
            </div>
        </div>
    );
}
