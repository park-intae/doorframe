'use client'

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
            <form onSubmit={handleSearch} className="rounded-full m-2 h-10 flex item-center bg-sub-back">
                <div className="search-icon"></div>
                <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </form>
        </>
    )
}