

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
            <form onSubmit={handleSearch} className="rounded-full m-2 h-10 flex item-center bg-main justify-around">
                <div className="my-auto self-start">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input className="w-110" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </form>
        </>
    )
}