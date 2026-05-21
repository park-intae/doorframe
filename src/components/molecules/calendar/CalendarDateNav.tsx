import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarDateNavProps {
    displayYear: number;
    displayDate: string;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
}

export default function CalendarDateNav({ 
    displayYear, 
    displayDate, 
    onPrev, 
    onNext, 
    onToday 
}: CalendarDateNavProps) {
    return (
        <div className="flex flex-col justify-center items-center w-full border-r border-white/20 pr-4 h-full">
            <div className="text-sm opacity-70 mb-1">{displayYear}</div>
            <div className="text-4xl font-bold mb-4 whitespace-nowrap">{displayDate}</div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={onPrev}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    aria-label="이전 날짜"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={onToday}
                    className="px-3 py-1 text-xs glass-button rounded-md hover:brightness-110 transition-all"
                >
                    오늘
                </button>
                <button 
                    onClick={onNext}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    aria-label="다음 날짜"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}
