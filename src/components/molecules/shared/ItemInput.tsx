import { RootState } from "@/store";
import { clearInput, setInputValue } from "@/store/slice/inputSlice";
import { addItem } from "@/store/slice/listSlice";
import { PlusIcon, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type ItemInputProps = {
    kind: 'memo' | 'todo';
}

export default function ItemInput({ kind }: ItemInputProps) {
    const value = useSelector((state: RootState) => state.input.value);
    const [deadline, setDeadline] = useState<string>('');
    const dispatch = useDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;

        dispatch(addItem({ 
            kind, 
            text: value, 
            deadline: kind === 'todo' && deadline ? deadline : undefined 
        }));
        
        dispatch(clearInput());
        setDeadline('');
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setInputValue(e.target.value));
    };

    return (
        <form className="summitForm border-b w-full max-w-sm overflow-hidden flex justify-center items-center self-center gap-2 mb-2 p-1" onSubmit={handleSubmit}>
            <input
                aria-label={`${kind === 'todo' ? '할 일' : '메모'} 입력`}
                className="focus:outline-none border-none flex-1 bg-transparent text-sm"
                placeholder={`${kind === 'todo' ? '할 일을 입력하세요' : '메모를 입력하세요'}`}
                value={value}
                onChange={handleChange}>
            </input>
            
            {kind === 'todo' && (
                <div className="flex items-center gap-1 border-l pl-2 border-white/20">
                    <label htmlFor="deadline" className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                        <CalendarIcon className="w-4 h-4" />
                    </label>
                    <input
                        id="deadline"
                        type="date"
                        className="bg-transparent focus:outline-none text-[10px] w-24 cursor-pointer"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        aria-label="마감일 선택"
                    />
                </div>
            )}

            <button aria-label={`${kind === 'todo' ? '할 일' : '메모'} 추가`} className="summitBTN bg-point rounded-lg p-1 flex items-center focus:outline-none hover:brightness-110 transition-all" type='submit'>
                <PlusIcon className="w-5 h-5" />
            </button>
        </form>
    )
}
