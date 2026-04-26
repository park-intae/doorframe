import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { WeatherIcon } from "../weather/WeatherIcon";
import WeatherChart from "./WeatherChart";
import { DailyForecast, WeatherHourly } from "@/type/weather";

interface WeatherViewProps {
    temperature: string | null;
    weather: string;
    region: string;
    forecast: DailyForecast[];
    hourly: WeatherHourly[];
    loading: boolean;
    error: string | null;
}

/**
 * 날씨 정보를 가로형 Flex 레이아웃과 캐러셀 구조로 보여주는 컴포넌트
 * 마우스 커서를 추적하는 고도화된 툴팁 시스템 포함
 */
export default function WeatherView({ 
    temperature, weather, region, forecast, hourly, loading, error 
}: WeatherViewProps) {
    const [page, setPage] = useState(0);
    const [tooltip, setTooltip] = useState<{ text: string; color: string } | null>(null);
    const [isScrollLocked, setIsLocked] = useState(false);
    
    // 마우스 좌표 추적을 위한 모션 값
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // 툴팁 움직임을 부드럽게 만들기 위한 스프링 설정
    const springConfig = { damping: 20, stiffness: 300 };
    const tooltipX = useSpring(mouseX, springConfig);
    const tooltipY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (isScrollLocked) return;
        
        // 휠의 움직임이 일정 강도 이상일 때만 작동 (감도 조절)
        if (Math.abs(e.deltaY) > 10) {
            setIsLocked(true);
            setPage(prev => (prev === 0 ? 1 : 0));
            
            // 0.6초 후 잠금 해제 (연속 전환 방지)
            setTimeout(() => setIsLocked(false), 600);
        }
    };

    // 로딩 및 에러 상태 처리
    if (loading) return <div className="w-66 h-52 flex items-center justify-center glass-sub rounded-xl">로딩 중...</div>;
    if (error) return <div className="w-66 h-52 flex items-center justify-center glass-sub rounded-xl text-red-500 text-xs p-4 text-center">{error}</div>;

    const regionParts = region?.split(' ') || [];
    const displayRegion = regionParts[regionParts.length - 1] || region;

    return (
        <div 
            id="weather-container" 
            className="relative overflow-hidden rounded-xl w-66 h-52 p-4 mr-4 flex flex-col bg-background glass-sub cursor-pointer select-none"
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('.group')) return;
                setPage(prev => (prev === 0 ? 1 : 0));
            }}
            onMouseMove={handleMouseMove}
            onWheel={handleWheel}
            onMouseLeave={() => setTooltip(null)}
        >
            <AnimatePresence mode="wait">
                {page === 0 ? (
                    <motion.div 
                        key="current"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col h-full"
                    >
                        {/* 상단: 실황 */}
                        <div className="flex flex-row items-center justify-between flex-1 min-h-0">
                            <div className="flex flex-row items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-main flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                    <WeatherIcon />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-xl font-bold leading-tight">{weather}</div>
                                    <div className="text-xs opacity-60 font-medium">{displayRegion}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-center">
                                <div className="text-4xl font-black text-slate-800 leading-none">
                                    {temperature}°
                                </div>
                            </div>
                        </div>
                        
                        {/* 하단: 차트 */}
                        <div className="flex-1 min-h-0 mt-1">
                            <WeatherChart data={hourly} />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="forecast"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col h-full"
                    >
                        <div className="text-[10px] font-bold mt-1 mb-2 opacity-50 uppercase tracking-wider text-center">Short-term Forecast</div>
                        
                        <div className="flex-1 flex flex-row justify-between items-center gap-1 mb-4">
                            {forecast.map((day, i) => (
                                <div key={day.date} className="flex flex-col items-center gap-2 flex-1 p-2 rounded-lg bg-white/5 border border-white/5 shadow-sm">
                                    <div className="text-[10px] font-bold text-slate-500">
                                        {i === 0 ? '오늘' : i === 1 ? '내일' : '모레'}
                                    </div>
                                    <div className="text-xs font-bold text-slate-800">{day.weatherStatus}</div>
                                    <div className="flex flex-col items-center leading-tight">
                                        {/* 최고 기온 */}
                                        <div 
                                            className="text-sm font-black text-rose-500 hover:scale-110 transition-transform"
                                            onMouseEnter={() => setTooltip({ text: '최고 기온', color: 'text-rose-400' })}
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            {day.maxTemp}°
                                        </div>
                                        {/* 최저 기온 */}
                                        <div 
                                            className="text-[10px] font-bold text-blue-500 hover:scale-110 transition-transform"
                                            onMouseEnter={() => setTooltip({ text: '최저 기온', color: 'text-blue-400' })}
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            {day.minTemp}°
                                        </div>
                                    </div>
                                    {/* 강수 확률 */}
                                    <div 
                                        className="flex justify-center w-full min-h-[12px]"
                                        onMouseEnter={() => day.precipitation !== '0%' && setTooltip({ text: '강수 확률', color: 'text-sky-400' })}
                                        onMouseLeave={() => setTooltip(null)}
                                    >
                                        {day.precipitation !== '0%' && (
                                            <div className="text-[8px] text-blue-400 font-bold hover:scale-110 transition-transform">{day.precipitation}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 마우스 트래킹 커스텀 툴팁 */}
            <AnimatePresence>
                {tooltip && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        style={{
                            position: 'absolute',
                            left: tooltipX,
                            top: tooltipY,
                            x: '-50%',
                            y: -35,
                            pointerEvents: 'none',
                        }}
                        className={`px-2 py-1 bg-slate-900/95 ${tooltip.color} text-[10px] font-black rounded shadow-2xl z-50 whitespace-nowrap border border-white/10`}
                    >
                        {tooltip.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 페이지 인디케이터 (가시성 강화) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none items-center">
                <div 
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                        page === 0 
                        ? 'w-6 bg-slate-800 ring-2 ring-white/20' 
                        : 'w-1.5 bg-slate-400/60'
                    }`} 
                />
                <div 
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                        page === 1 
                        ? 'w-6 bg-slate-800 ring-2 ring-white/20' 
                        : 'w-1.5 bg-slate-400/60'
                    }`} 
                />
            </div>

            {/* 데이터 출처 */}
            <div className="absolute bottom-1 right-2 text-[8px] text-slate-400/50 uppercase select-none">
                Data by KMA
            </div>
        </div>
    );
}
