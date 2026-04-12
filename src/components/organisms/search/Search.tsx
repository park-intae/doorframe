

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
        <>
            <form onSubmit={handleSearch} className="rounded-full m-2 h-15 w-186 flex justify-around item-center bg-indigo-50 border border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-300/30 transition-all">
                <div className="my-auto ml-5">
                    <SearchIcon className="w-full h-5 text-title" />
                </div>
                <input aria-label="검색어 입력" className="w-[85%] mr-[5%] focus:outline-none text-title placeholder:text-context bg-transparent" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </form>
        </>
    )
}