import { RootState } from "@/store";
import { clearInput, setInputValue } from "@/store/slice/inputSlice";
import { addItem } from "@/store/slice/listSlice";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
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
            text: value.trim(), 
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
        <form 
            onSubmit={handleSubmit}
            className="flex items-center gap-2 w-full glass-sub !rounded-xl px-3.5 py-2 hover:border-point/40 focus-within:!border-point focus-within:ring-2 focus-within:ring-point/20 transition-all duration-200"
        >
            <input
                aria-label={`${kind === 'todo' ? '할 일' : '메모'} 입력`}
                className="focus:outline-none bg-transparent flex-1 text-sm text-title placeholder:text-context/60 min-w-0"
                placeholder={kind === 'todo' ? '새로운 할 일을 입력하세요...' : '새로운 메모를 입력하세요...'}
                value={value}
                onChange={handleChange}
            />
            
            {kind === 'todo' && (
                <div className="flex items-center gap-1.5 pl-2.5 border-l border-context/20 shrink-0">
                    <label 
                        htmlFor="deadline" 
                        className={`flex items-center cursor-pointer transition-colors ${deadline ? 'text-point' : 'text-context/50 hover:text-point'}`}
                        title="마감일 선택"
                    >
                        <CalendarIcon className="w-4 h-4" />
                    </label>
                    <input
                        id="deadline"
                        type="date"
                        className="bg-transparent focus:outline-none text-xs cursor-pointer text-title dark:[color-scheme:dark]"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        aria-label="마감일 선택"
                    />
                </div>
            )}

            <button 
                aria-label={`${kind === 'todo' ? '할 일' : '메모'} 추가`} 
                className="bg-point hover:brightness-105 active:scale-95 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all duration-150 shrink-0 cursor-pointer" 
                type="submit"
            >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>추가</span>
            </button>
        </form>
    );
}
