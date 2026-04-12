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
        <div id="today" className="rounded-xl m-3 p-3 flex flex-col gap-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <hr className="border-[#727272]/80" />
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
        </div>
    );

    return (
        <section id="today" className="font-bold rounded-xl m-3 p-3 text-left flex flex-col gap-4" aria-label="오늘의 날짜와 시간">
            <div id="date" className="text-context text-3xl xl:text-3xl">{date}</div>
            <hr className="border-[#727272]/80 border-1" />
            <time id="time" className="time text-title text-4xl xl:text-7xl">{time}</time>
        </section>
    );
}