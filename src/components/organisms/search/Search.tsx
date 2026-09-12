

import { SearchIcon } from "lucide-react";
import { useState } from "react";

export default function Search() {
    const [keyword, setKeyword] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
        setKeyword('');
    }

    return (
        <form 
            onSubmit={handleSearch} 
            className="rounded-full my-1 h-12 w-full max-w-[480px] lg:max-w-[894px] mdDT:max-w-[924px] flex items-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm focus-within:ring-4 focus-within:ring-point/20 focus-within:border-point/50 transition-all font-paperlogy px-4 gap-3"
            role="search"
        >
            <div className="flex items-center justify-center shrink-0 text-context/70 ml-1">
                <SearchIcon className="w-5 h-5 text-context" />
            </div>
            <input 
                aria-label="검색어 입력" 
                className="flex-1 focus:outline-none text-title text-[18px] sm:text-[20px] placeholder:text-context/50 bg-transparent" 
                type="text" 
                placeholder="무엇을 검색하시나요?"
                value={keyword} 
                onChange={(e) => setKeyword(e.target.value)} 
            />
        </form>
    )
}