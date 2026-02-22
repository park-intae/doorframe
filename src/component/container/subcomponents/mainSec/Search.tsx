

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
            <form onSubmit={handleSearch} className="rounded-full m-2 h-15 w-186 flex justify-around item-center bg-main justify-between">
                <div className="my-auto ml-5">
                    <SearchIcon className="w-full h-5 text-context" />
                </div>
                <input className="w-[85%] mr-[5%]" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </form>
        </>
    )
}