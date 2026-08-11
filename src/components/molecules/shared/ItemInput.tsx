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
    const targetDate = useSelector((state: RootState) => state.input.targetDate);
    const [deadline, setDeadline] = useState<string>('');
    const dispatch = useDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;

        dispatch(addItem({ 
            kind, 
            text: value, 
            date: targetDate,
            deadline: kind === 'todo' && deadline ? deadline : undefined 
        }));
        
        dispatch(clearInput());
        setDeadline('');
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setInputValue(e.target.value));
    };

    return (
        <form className="flex items-center gap-2 w-full bg-white/10 rounded-xl px-3 py-2 border border-black/50 dark:border-white/10 focus-within:border-point focus-within:shadow-[0_0_8px_rgba(var(--color-point),0.4)] transition-all duration-300" onSubmit={handleSubmit}>
            <input
                aria-label={`${kind === 'todo' ? '할 일' : '메모'} 입력`}
                className="focus:outline-none bg-transparent flex-1 text-sm text-title placeholder-white/40"
                placeholder={`${kind === 'todo' ? '할 일을 입력하세요' : '메모를 입력하세요'}`}
                value={value}
                onChange={handleChange}>
            </input>
            
            {kind === 'todo' && (
                <div className="flex items-center gap-1 border-l pl-2 border-black/50 dark:border-white/20">
                    <label htmlFor="deadline" className={`cursor-pointer transition-colors ${deadline ? 'text-point' : 'opacity-60 hover:opacity-100'}`}>
                    </label>
                    <input
                        id="deadline"
                        type="date"
                        className="bg-transparent focus:outline-none text-[13px] w-24 cursor-pointer text-title"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        aria-label="마감일 선택"
                    />
                </div>
            )}

            <button 
                aria-label={`${kind === 'todo' ? '할 일' : '메모'} 추가`} 
                className="bg-point text-white rounded-lg p-1.5 focus:outline-none hover:scale-105 active:scale-95 transition-transform duration-200 shadow-sm" 
                type='submit'
            >
                <PlusIcon className="w-4 h-4" />
            </button>
        </form>
    )
}
