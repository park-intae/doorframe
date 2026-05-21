import { useCalendar } from '@/hooks/useCalendar';
import CalendarDateNav from '../../molecules/calendar/CalendarDateNav';
import CalendarTabs from '../../molecules/calendar/CalendarTabs';
import CalendarList from '../../molecules/calendar/CalendarList';

export default function CalendarSlide() {
    const {
        displayYear,
        displayDate,
        kind,
        setKind,
        filteredItems,
        handlePrevDay,
        handleNextDay,
        handleGoToday
    } = useCalendar();

    return (
        <div className="flex flex-row w-full h-full p-4 gap-4 text-context font-paperlogy">
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
            <div className="flex flex-col flex-1 pl-2">
                <CalendarTabs 
                    kind={kind}
                    setKind={setKind}
                    itemCount={filteredItems.length}
                />
                <CalendarList 
                    items={filteredItems}
                />
            </div>
        </div>
    );
}
