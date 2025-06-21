'use client';

import { useRecoilValue } from 'recoil';
import { todayState } from 'app/recoil/atoms/todayAtom';

export default function Today() {
    const { date, time } = useRecoilValue(todayState);

    return (
        <div className="today">
            <div className="date">{date}</div>
            <div className="time">{time}</div>
        </div>
    );
}