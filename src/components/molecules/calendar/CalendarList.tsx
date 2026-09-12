import { ListItem, toggleItem, removeItem } from '@/store/slice/listSlice';
import { useAppDispatch } from '@/store/hooks';
import { Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodoDeadlineStatus } from '@/util/todoDate';

interface CalendarListProps {
    items: ListItem[];
}

export default function CalendarList({ items }: CalendarListProps) {
    const dispatch = useAppDispatch();

    // 리스트 내부 스크롤 휠 이벤트 전파 방지 (캐러셀 페이지 전환 방지)
    const handleListWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
    };

    return (
        <div 
            className="flex-1 overflow-y-auto scrollbar-thin pr-1.5 glass-sub p-3"
            onWheel={handleListWheel}
        >
            <AnimatePresence mode="popLayout">
                {items.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                        {items.map(item => {
                            const deadlineStatus = item.kind === 'todo' 
                                ? getTodoDeadlineStatus(item.deadline, item.completed, undefined, item.date) 
                                : null;
                            const isUrgent = !!deadlineStatus?.isUrgent;

                            return (
                                <motion.li 
                                    key={item.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`flex items-center justify-between p-2 rounded-lg transition-colors group border ${
                                        isUrgent 
                                            ? 'bg-rose-500/15 hover:bg-rose-500/20 border-rose-500/50 dark:border-rose-400/50' 
                                            : 'hover:bg-white/10 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {item.kind === 'todo' && (
                                            <input 
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={() => dispatch(toggleItem(item.id))}
                                                aria-label={`${item.text} 완료 여부`}
                                                className="w-4 h-4 rounded border-black/20 dark:border-white/30 bg-transparent cursor-pointer shrink-0"
                                            />
                                        )}
                                        <span className={`truncate text-sm flex-1 min-w-0 ${item.completed ? 'line-through opacity-50' : 'text-title'}`}>
                                            {item.text}
                                        </span>
                                        {deadlineStatus?.hasDeadline && (
                                            <div className="flex items-center shrink-0 mr-1">
                                                <span 
                                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                                                        deadlineStatus.isUrgent 
                                                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40' 
                                                            : item.completed
                                                            ? 'bg-black/5 dark:bg-white/5 text-context/40'
                                                            : 'bg-black/5 dark:bg-white/10 text-context border border-black/10 dark:border-white/10'
                                                    }`}
                                                    title={`기간: ${item.date || ''} ~ ${item.deadline}`}
                                                >
                                                    <Calendar className="w-3 h-3 shrink-0" />
                                                    <span>{deadlineStatus.badgeText}</span>
                                                    <span className="text-[10px] opacity-80 font-normal">({deadlineStatus.periodText})</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => dispatch(removeItem(item.id))}
                                        className="opacity-40 group-hover:opacity-100 hover:!opacity-100 p-1.5 text-context/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all hover:scale-110 active:scale-95 shrink-0"
                                        aria-label={`${item.text} 삭제`}
                                        title="삭제"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </motion.li>
                            );
                        })}
                    </ul>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col items-center justify-center opacity-30 text-sm italic"
                    >
                        항목이 없습니다
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
