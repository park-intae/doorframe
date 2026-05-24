import { useEffect } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { useAppDispatch } from '@/store/hooks';
import { setTargetDate } from '@/store/slice/inputSlice';
import CalendarDateNav from '../../molecules/calendar/CalendarDateNav';
import CalendarTabs from '../../molecules/calendar/CalendarTabs';
import CalendarList from '../../molecules/calendar/CalendarList';

export default function CalendarSlide() {
    const dispatch = useAppDispatch();
    const {
        displayYear,
        displayDate,
        formattedDate,
        kind,
        setKind,
        filteredItems,
        handlePrevDay,
        handleNextDay,
        handleGoToday
    } = useCalendar();

    useEffect(() => {
        dispatch(setTargetDate(formattedDate));
    }, [dispatch, formattedDate]);

    return (
        <div className="flex flex-col w-full h-full p-6 glass font-paperlogy overflow-hidden">
            <h2 className="text-xl font-bold text-title mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-point rounded-full" />
                일정 및 메모
            </h2>
            <div className="flex flex-row flex-1 gap-4 text-context overflow-hidden">
                {/* 좌측: 날짜 및 네비게이션 (Molecule) */}
                <div className="w-1/3">
                    <CalendarDateNav 
                        displayYear={displayYear}
                        displayDate={displayDate}
                        onPrev={handlePrevDay}
                        onNext={handleNextDay}
                        onToday={handleGoToday}
                    />
                </div>

                {/* 우측: 리스트 영역 (Molecules 조합) */}
                <div className="flex flex-col flex-1 pl-2 overflow-hidden">
                    <CalendarTabs 
                        kind={kind}
                        setKind={setKind}
                        itemCount={filteredItems.length}
                    />
                    <div className="flex-1 overflow-hidden">
                        <CalendarList 
                            items={filteredItems}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
