'use client'

import { RootState } from "app/store";
import { Bookmark } from "app/type/bookmark";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Menu, X } from "lucide-react";

export default function FavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const bookmarks = useSelector((state: RootState) => state.bookmarks);

    return (
        <aside className={`
        fixed left-0 h-full w-64 p-4 bg-white shadow-lg z-50
        flex flex-col gap-4
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-[70%]"}
        `}>
            <div className="flex justify-end mr-2 mb-8">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 bg-blue-500 rounded text-white"
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {bookmarks.map((item: Bookmark) => (
                    <a className="fav flex items-center gap-2 hover:bg-gray-100 p-2 rounded"
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className="IcoBg">
                            <img src={item.icon} alt={item.title} />
                        </div>
                        <p className="tit">{item.title}</p>
                    </a>
                ))}
            </div>
        </aside>
    )
}