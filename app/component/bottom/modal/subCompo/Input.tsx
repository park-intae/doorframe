'use client';

import { RootState } from "app/store";
import { clearInput, setInputValue } from "app/store/inputSlice";
import { useDispatch, useSelector } from "react-redux";

type InputProps = {
    onSubmit: (value: string) => void;
}

export default function Input({ onSubmit }: InputProps) {
    const value = useSelector((state: RootState) => state.input.value);
    const dispatch = useDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(value);
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
            <button type='submit'></button>
        </form>
    )







}