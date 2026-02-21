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
        <div className="today font-bold rounded-xl m-3 p-3 text-left flex flex-col gap-4">
            <div className="date text-context text-3xl xl:text-3xl">{date}</div>
            <hr className="border-[#727272]/80 border-1" />
            <div className="time text-title text-4xl xl:text-7xl">{time}</div>
        </div>
    );
}