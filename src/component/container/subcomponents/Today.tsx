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

    if (!date || !time) return <div>Loading...</div>

    return (
        <div className="today rounded-xl m-3 p-3 text-center bg-background flex flex-col gap-4">
            <div className="date text-3xl xl:text-4xl">{date}</div>
            <div className="time text-6xl xl:text-8xl">{time}</div>
        </div>
    );
}