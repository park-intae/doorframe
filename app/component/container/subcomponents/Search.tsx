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
            <form onSubmit={handleSearch} className="border rounded-full m-3 h-8 flex item-center">
                <div className="search-icon"></div>
                <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </form>
        </>
    )
}