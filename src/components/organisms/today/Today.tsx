import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateDateTime } from "@/store/slice/todaySlice";
import { useEffect } from "react";
import { Calendar } from "lucide-react";

export default function Today() {
    const { date, time } = useAppSelector((state) => state.today);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(updateDateTime());
        const timer = setInterval(() => {
            dispatch(updateDateTime());
        }, 1000);

        return () => clearInterval(timer);
    }, [dispatch]);

    if (!date || !time) return (
        <div id="today" className="glass w-full rounded-2xl p-5 flex flex-col justify-between h-[160px] animate-pulse">
            <div className="h-5 bg-black/10 dark:bg-white/10 rounded w-1/2"></div>
            <div className="h-12 bg-black/10 dark:bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/3"></div>
        </div>
    );

    return (
        <section 
            id="today" 
            className="glass w-full rounded-2xl p-5 text-left flex flex-col justify-between h-[160px] font-paperlogy select-none relative overflow-hidden" 
            aria-label="오늘의 날짜와 시간"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-context text-sm font-semibold">
                    <Calendar className="w-4 h-4 text-point shrink-0" />
                    <span id="date">{date}</span>
                </div>
            </div>
            <div className="flex items-baseline justify-between my-auto">
                <time id="time" className="time text-title text-4xl smDT:text-5xl font-black tracking-tight whitespace-nowrap">
                    {time}
                </time>
            </div>
            <div className="flex items-center justify-between text-xs text-context/80 font-medium">
                <span>오늘도 좋은 하루 보내세요! ☀️</span>
            </div>
        </section>
    );
}