

import { RootState } from "@/store";
import { ListKind, removeItem, toggleItem } from "@/store/slice/listSlice";
import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";

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
            {filteredItems.map(item => (
                <li 
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5" 
                    key={item.id}
                >
                    {kind === 'todo' ? (
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            <input
                                aria-label={`${item.text} 완료 여부`}
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => dispatch(toggleItem(item.id))}
                                className="w-4 h-4 rounded border-white/20 bg-white/10 checked:bg-point focus:ring-0 cursor-pointer"
                            />
                            <span 
                                className={`text-sm truncate transition-all ${item.completed ? 'line-through opacity-50' : 'text-title'}`}
                                title={item.text}
                            >
                                {item.text}
                            </span>
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
                        className="p-1 text-white/50 hover:text-red-400 transition-colors focus:outline-none"
                        onClick={() => dispatch(removeItem(item.id))}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </li>
            ))}
        </ul>
    );
}