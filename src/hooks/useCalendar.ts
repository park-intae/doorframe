import { useState, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { ListKind } from '@/store/slice/listSlice';
import { parseLocalDate, getDaysDifference } from '@/util/todoDate';

export function useCalendar() {
    const [viewDate, setViewDate] = useState(new Date());
    const [kind, setKind] = useState<ListKind>('memo');
    const items = useAppSelector((state) => state.list.items);

    const formattedDate = useMemo(() => {
        return viewDate.toISOString().split('T')[0];
    }, [viewDate]);

    const displayDate = useMemo(() => {
        return viewDate.toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
        });
    }, [viewDate]);

    const displayYear = viewDate.getFullYear();

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (item.kind !== kind) return false;
            
            // 메모는 해당 날짜에만 표시
            if (kind === 'memo') return item.date === formattedDate;
            
            // 할 일 필터링
            if (kind === 'todo') {
                // 마감일이 설정된 경우: 등록일(item.date)부터 마감일(item.deadline)까지 전 기간에 표시
                if (item.deadline) {
                    const startDate = item.date || item.deadline;
                    const minDate = startDate <= item.deadline ? startDate : item.deadline;
                    const maxDate = startDate <= item.deadline ? item.deadline : startDate;
                    return formattedDate >= minDate && formattedDate <= maxDate;
                }
                
                // 마감일이 없는 경우: 등록일 당일에만 표시
                return item.date === formattedDate;
            }
            
            return false;
        });
    }, [items, kind, formattedDate]);

    const handlePrevDay = () => {
        const newDate = new Date(viewDate);
        newDate.setDate(viewDate.getDate() - 1);
        setViewDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(viewDate);
        newDate.setDate(viewDate.getDate() + 1);
        setViewDate(newDate);
    };

    const handleGoToday = () => {
        setViewDate(new Date());
    };

    return {
        viewDate,
        formattedDate,
        displayDate,
        displayYear,
        kind,
        setKind,
        filteredItems,
        handlePrevDay,
        handleNextDay,
        handleGoToday
    };
}
