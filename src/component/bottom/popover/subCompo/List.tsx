

import { RootState } from "@/store";
import { ListKind, removeItem, toggleItem } from "@/store/slice/listSlice";
import { useDispatch, useSelector } from "react-redux";

type ListProps = {
    kind: ListKind;
};

export default function List({ kind }: ListProps) {
    const dispatch = useDispatch();

    const filteredItems = useSelector((state: RootState) =>
        state.list.items.filter(item => item.kind == kind)
    );

    return (
        <ul className="min-h-20 max-h-75 overflow-y-auto scrollbar-hide">
            {filteredItems.map(item => (
                <li className="flex flex-row mx-5 justify-between border-b" key={item.id} style={{ marginBottom: '0.5rem' }}>
                    {kind === 'todo' ? (
                        <label
                            className="flex-grow min-w-30 max-w-xs truncate whitespace-nowrap overflow-hidden"
                            style={{ textDecoration: item.completed ? 'line-through' : 'none' }}
                            title={item.text}
                        >
                            <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => dispatch(toggleItem(item.id))}
                            />
                            {item.text}
                        </label>
                    ) : (
                        <span className="flex-grow max-w-50 truncate whitespace-nowrap overflow-hidden" title={item.text}>{item.text}</span>
                    )}
                    <button
                        className="border rounded-lg bg-red-500 text-white w-6 h-6"
                        style={{ marginLeft: '0.5rem' }}
                        onClick={() => dispatch(removeItem(item.id))}>
                        -
                    </button>
                </li>
            )
            )}
        </ul>
    );
}