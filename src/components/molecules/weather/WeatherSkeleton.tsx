/**
 * 날씨 데이터 로딩 중 표시되는 글래스모피즘 스켈레톤 UI 컴포넌트
 * 실제 날씨 카드(실황 + 시간별 기온 차트 + 우측 도트 인디케이터)와 동일한 레이아웃을 가집니다.
 */
export default function WeatherSkeleton() {
    return (
        <div 
            id="weather-skeleton" 
            className="relative overflow-hidden rounded-2xl w-full h-[296px] p-4.5 flex flex-col glass select-none font-paperlogy animate-pulse"
            aria-busy="true"
            aria-label="날씨 정보를 불러오는 중입니다"
        >
            <div className="flex flex-col h-full pr-3">
                {/* 상단: 날씨 실황 스켈레톤 */}
                <div className="flex flex-row items-center justify-between flex-1 min-h-0">
                    <div className="flex flex-row items-center gap-3">
                        {/* 날씨 아이콘 원형 플레이스홀더 */}
                        <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
                        
                        {/* 날씨 상태 및 지역 텍스트 */}
                        <div className="flex flex-col justify-center gap-1.5">
                            <div className="h-5 w-20 bg-black/15 dark:bg-white/15 rounded-md" />
                            <div className="h-3.5 w-28 bg-black/10 dark:bg-white/10 rounded-md" />
                        </div>
                    </div>

                    {/* 기온 텍스트 플레이스홀더 */}
                    <div className="flex flex-col items-end justify-center">
                        <div className="h-9 w-14 bg-black/15 dark:bg-white/15 rounded-lg" />
                    </div>
                </div>
                
                {/* 하단: 시간별 기온 차트 스켈레톤 */}
                <div className="flex-1 min-h-0 mt-1 flex flex-col justify-end">
                    <div className="w-full h-24 rounded-xl bg-black/5 dark:bg-white/5 flex items-end justify-between px-5 py-2.5 gap-2 border border-black/5 dark:border-white/5">
                        <div className="w-2 h-8 bg-black/10 dark:bg-white/10 rounded-full" />
                        <div className="w-2 h-11 bg-black/10 dark:bg-white/10 rounded-full" />
                        <div className="w-2 h-15 bg-black/15 dark:bg-white/15 rounded-full" />
                        <div className="w-2 h-13 bg-black/15 dark:bg-white/15 rounded-full" />
                        <div className="w-2 h-10 bg-black/10 dark:bg-white/10 rounded-full" />
                        <div className="w-2 h-7 bg-black/10 dark:bg-white/10 rounded-full" />
                    </div>
                    {/* 시간 라벨 플레이스홀더 */}
                    <div className="flex justify-between px-3 mt-1.5">
                        <div className="w-6 h-2 bg-black/10 dark:bg-white/10 rounded" />
                        <div className="w-6 h-2 bg-black/10 dark:bg-white/10 rounded" />
                        <div className="w-6 h-2 bg-black/10 dark:bg-white/10 rounded" />
                        <div className="w-6 h-2 bg-black/10 dark:bg-white/10 rounded" />
                        <div className="w-6 h-2 bg-black/10 dark:bg-white/10 rounded" />
                    </div>
                </div>
            </div>

            {/* 우측 세로 도트 인디케이터 스켈레톤 */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-20 py-1.5 px-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div className="w-1.5 h-5 bg-black/20 dark:bg-white/20 rounded-full" />
                <div className="w-1.5 h-1.5 bg-black/10 dark:bg-white/10 rounded-full" />
            </div>

            {/* 하단 출처 표기 스켈레톤 */}
            <div className="absolute bottom-1 right-2 w-16 h-2 bg-black/5 dark:bg-white/5 rounded" />
        </div>
    );
}
