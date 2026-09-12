

import { RootState } from "@/store";
import { ListKind, removeItem, toggleItem } from "@/store/slice/listSlice";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, Calendar } from "lucide-react";
import { getTodoDeadlineStatus } from "@/util/todoDate";

type ListProps = {
    kind: ListKind;
};

export default function List({ kind }: ListProps) {
    const dispatch = useDispatch();

    const filteredItems = useSelector((state: RootState) =>
        state.list.items.filter(item => item.kind == kind)
    );

    return (
        <ul className="flex flex-col gap-2 p-1">
            {filteredItems.map(item => {
                const deadlineStatus = kind === 'todo' 
                    ? getTodoDeadlineStatus(item.deadline, item.completed, undefined, item.date) 
                    : null;
                const isUrgent = !!deadlineStatus?.isUrgent;

                return (
                    <li 
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${
                            isUrgent 
                                ? 'bg-rose-500/15 hover:bg-rose-500/20 border-rose-500/50 dark:border-rose-400/50' 
                                : 'bg-white/5 hover:bg-white/10 border-black/50 dark:border-white/10'
                        }`} 
                        key={item.id}
                    >
                        {kind === 'todo' ? (
                            <div className="flex items-center gap-3 flex-1 overflow-hidden min-w-0">
                                <input
                                    aria-label={`${item.text} 완료 여부`}
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => dispatch(toggleItem(item.id))}
                                    className="w-4 h-4 rounded border-black/20 dark:border-white/20 bg-white/10 checked:bg-point focus:ring-0 cursor-pointer shrink-0"
                                />
                                <span 
                                    className={`text-sm truncate transition-all flex-1 min-w-0 ${item.completed ? 'line-through opacity-50' : 'text-title'}`}
                                    title={item.text}
                                >
                                    {item.text}
                                </span>
                                {deadlineStatus?.hasDeadline && (
                                    <div className="flex items-center shrink-0 mr-1.5">
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
                        ) : (
                            <span 
                                className="text-sm text-title truncate px-1" 
                                title={item.text}
                            >
                                {item.text}
                            </span>
                        )}
                        <button
                            aria-label={`${item.text} 삭제`}
                            className="opacity-60 hover:opacity-100 p-1.5 text-context/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all hover:scale-110 active:scale-95 focus:outline-none shrink-0"
                            onClick={() => dispatch(removeItem(item.id))}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}