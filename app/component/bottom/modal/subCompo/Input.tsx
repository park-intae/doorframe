'use client';

import { RootState } from "app/store";
import { clearInput, setInputValue } from "app/store/slice/inputSlice";
import { addItem } from "app/store/slice/listSlice";
import { useDispatch, useSelector } from "react-redux";

type InputProps = {
    kind: 'memo' | 'todo';
}

export default function Input({ kind }: InputProps) {
    const value = useSelector((state: RootState) => state.input.value);
    const dispatch = useDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(addItem({ kind, text: value }));
        dispatch(clearInput());
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setInputValue(e.target.value));
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={value}
                onChange={handleChange}>
            </input>
            <button type='submit'>등록</button>
        </form>
    )
}