'use client';

import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { updateDateTime } from "app/store/slice/todaySlice";
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
        <div className="today">
            <div className="date">{date}</div>
            <div className="time">{time}</div>
        </div>
    );
}