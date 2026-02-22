

import { RootState } from "@/store";
import { clearInput, setInputValue } from "@/store/slice/inputSlice";
import { addItem } from "@/store/slice/listSlice";
import { PlusIcon } from "lucide-react";
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
        <form className="summitForm border-b w-fit overflow-hidden flex justify-center items-center self-center gap-2 mb-2" onSubmit={handleSubmit}>
            <input
                className="focus:outline-none focus:ring-0 border-none"
                placeholder="내용을 입력하세요"
                value={value}
                onChange={handleChange}>
            </input>
            <button className="summitBTN bg-point rounded-lg flex items-center" type='submit'>
                <PlusIcon className="w-5 h-5" />
            </button>
        </form>
    )
}