import { useCoinMarket } from "@/hooks/useCoinMarket";
import CoinListItem from "./CoinListItem";

export default function CoinList() {
    const { coins } = useCoinMarket();

    // 테이블 내부 휠 이벤트 전파 방지 (캐러셀 이동 막기)
    const handleTableWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="flex flex-col w-full p-6 glass font-paperlogy overflow-hidden h-full">
            <h2 className="text-xl font-bold text-title mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-point rounded-full" />
                실시간 코인 시세 (KRW)
            </h2>
            
            <div className="w-full flex-1 overflow-hidden flex flex-col">
                {/* 헤더 */}
                <div className="grid grid-cols-5 gap-2 pb-2 mb-2 border-b border-black/50 dark:border-white/20 text-sm font-bold text-context">
                    <div className="col-span-2">코인명</div>
                    <div className="text-right">현재가</div>
                    <div className="text-right">전일대비</div>
                    <div className="text-right">변동액</div>
                </div>

                {/* 데이터 리스트 (스크롤 가능 영역) */}
                <div 
                    className="flex-1 overflow-y-auto pr-2 scrollbar-thin glass-sub p-4"
                    onWheel={handleTableWheel}
                >
                    <div className="flex flex-col gap-1">
                        {coins.length === 0 ? (
                            <div className="flex items-center justify-center py-10 text-context/50">
                                데이터를 불러오는 중...
                            </div>
                        ) : (
                            coins.map((coin) => (
                                <CoinListItem key={coin.symbol} coin={coin} />
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
