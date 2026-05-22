import { ListKind } from '@/store/slice/listSlice';
import { ClipboardList, StickyNote, CalendarDays } from 'lucide-react';

interface CalendarTabsProps {
    kind: ListKind;
    setKind: (kind: ListKind) => void;
    itemCount: number;
}

export default function CalendarTabs({ kind, setKind, itemCount }: CalendarTabsProps) {
    return (
        <div className="flex justify-between items-center mb-3">
            <div className="flex gap-2">
                <button 
                    onClick={() => setKind('memo')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${kind === 'memo' ? 'bg-white/20 font-bold' : 'opacity-50 hover:opacity-80'}`}
                >
                    <StickyNote size={14} />
                    메모
                </button>
                <button 
                    onClick={() => setKind('todo')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${kind === 'todo' ? 'bg-white/20 font-bold' : 'opacity-50 hover:opacity-80'}`}
                >
                    <ClipboardList size={14} />
                    할 일
                </button>
            </div>
            <div className="text-[10px] opacity-60 flex items-center gap-1">
                <CalendarDays size={12} />
                {itemCount} 개 항목
            </div>
        </div>
    );
}
