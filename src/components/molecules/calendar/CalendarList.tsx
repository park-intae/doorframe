import { ListItem, toggleItem, removeItem } from '@/store/slice/listSlice';
import { useAppDispatch } from '@/store/hooks';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarListProps {
    items: ListItem[];
}

export default function CalendarList({ items }: CalendarListProps) {
    const dispatch = useAppDispatch();

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
            <AnimatePresence mode="popLayout">
                {items.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                        {items.map(item => (
                            <motion.li 
                                key={item.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {item.kind === 'todo' && (
                                        <input 
                                            type="checkbox"
                                            checked={item.completed}
                                            onChange={() => dispatch(toggleItem(item.id))}
                                            className="w-4 h-4 rounded border-white/30 bg-transparent cursor-pointer"
                                        />
                                    )}
                                    <span className={`truncate text-sm ${item.completed ? 'line-through opacity-50' : ''}`}>
                                        {item.text}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => dispatch(removeItem(item.id))}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                    aria-label="삭제"
                                >
                                    <ChevronRight size={14} className="rotate-45" />
                                </button>
                            </motion.li>
                        ))}
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
