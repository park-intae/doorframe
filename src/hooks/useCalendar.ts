import { useState, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { ListKind } from '@/store/slice/listSlice';

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
                // 1. 해당 날짜에 생성된 할 일
                if (item.date === formattedDate) return true;
                
                // 2. 마감일이 설정된 경우 D-1 로직 적용
                if (item.deadline) {
                    const deadlineDate = new Date(item.deadline);
                    const viewDateObj = new Date(formattedDate);
                    
                    // 시간 차이를 일 단위로 계산
                    const diffTime = deadlineDate.getTime() - viewDateObj.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    // 마감일 당일(0) 또는 전날(1)이면 표시
                    return diffDays === 0 || diffDays === 1;
                }
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
