import { useEffect } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { useAppDispatch } from '@/store/hooks';
import { setTargetDate } from '@/store/slice/inputSlice';
import CalendarList from '../../molecules/calendar/CalendarList';
import ItemInput from '../../molecules/shared/ItemInput';
import { ChevronLeft, ChevronRight, CheckCircle2, StickyNote } from 'lucide-react';

export default function CalendarSlide() {
    const dispatch = useAppDispatch();
    const {
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
        <div className="flex flex-col w-full h-full p-4.5 glass font-paperlogy overflow-hidden justify-between">
            {/* 상단 헤더: 탭(할일/메모) + 카운트 배지 + 날짜 네비게이션 */}
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                {/* 좌측: 탭 & 개수 배지 */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setKind('todo')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            kind === 'todo'
                                ? 'bg-point text-white shadow-sm shadow-point/30'
                                : 'text-context/70 hover:bg-black/5 dark:hover:bg-white/10'
                        }`}
                    >
                        <CheckCircle2 size={16} />
                        <span>할 일</span>
                    </button>
                    <button
                        onClick={() => setKind('memo')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            kind === 'memo'
                                ? 'bg-point text-white shadow-sm shadow-point/30'
                                : 'text-context/70 hover:bg-black/5 dark:hover:bg-white/10'
                        }`}
                    >
                        <StickyNote size={16} />
                        <span>메모</span>
                    </button>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-point/15 text-point">
                        {filteredItems.length}개
                    </span>
                </div>

                {/* 우측: 날짜 선택 및 이전/다음 네비게이션 */}
                <div className="flex items-center gap-1 text-context">
                    <button
                        onClick={handlePrevDay}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                        aria-label="이전 날짜"
                        title="이전 날짜"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={handleGoToday}
                        className="text-xs font-bold text-title hover:text-point px-2 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
                        title="오늘 날짜로 이동"
                    >
                        {displayDate}
                    </button>
                    <button
                        onClick={handleNextDay}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                        aria-label="다음 날짜"
                        title="다음 날짜"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* 중앙: 할 일/메모 리스트 (전체 너비 확보 및 부드러운 스크롤) */}
            <div className="flex-1 min-h-0 py-2.5 overflow-hidden flex flex-col">
                <CalendarList items={filteredItems} />
            </div>

            {/* 하단: 입력 필드 (도킹) */}
            <div className="flex-shrink-0 pt-1">
                <ItemInput kind={kind} />
            </div>
        </div>
    );
}
