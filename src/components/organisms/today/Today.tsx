import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateDateTime } from "@/store/slice/todaySlice";
import { useEffect } from "react";

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
        <div id="today" className="rounded-xl m-1 py-2 pl-6 mdDT:pl-8 pr-2 flex flex-col gap-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <hr className="border-[#727272]/80" />
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
        </div>
    );

    return (
        <section id="today" className="font-bold rounded-xl m-1 py-2 pl-6 mdDT:pl-8 pr-2 text-left flex flex-col gap-2 smDT:gap-1 mdDT:gap-4" aria-label="오늘의 날짜와 시간">
            <div id="date" className="text-context text-xl smDT:text-lg mdDT:text-3xl">{date}</div>
            <hr className="border-[#727272]/80 border-1" />
            <time id="time" className="time text-title text-4xl smDT:text-5xl mdDT:text-7xl whitespace-nowrap">{time}</time>
        </section>
    );
}