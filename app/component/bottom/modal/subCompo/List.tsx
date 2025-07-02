'use client'

import { RootState } from "app/store";
import { ListKind, removeItem, toggleItem } from "app/store/slice/listSlice";
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
        <ul>
            {filteredItems.map(item => (
                <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                    {kind === 'todo' ? (
                        <label style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                            <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => dispatch(toggleItem(item.id))}
                            />
                            {item.text}
                        </label>
                    ) : (
                        <span>{item.text}</span>
                    )}
                    <button
                        style={{ marginLeft: '0.5rem' }}
                        onClick={() => dispatch(removeItem(item.id))}>
                        삭제
                    </button>
                </li>
            )
            )}
        </ul>
    );
}