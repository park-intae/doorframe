'use client'

import { RootState } from "app/store";
import { Bookmark } from "app/type/bookmark";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, MinusIcon, X } from "lucide-react";
import AddFav from "./favBar/AddFav";
import { loadBookmarks, removeBookmark } from "app/store/slice/bookmarkSlice";

export default function FavBar() {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const bookmarks = useSelector((state: RootState) => state.bookmarks);

    useEffect(() => {
        setMounted(true);
        dispatch(loadBookmarks());
    }, [dispatch]);

    const handleRemove = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('북마크를 삭제하시겠습니까')) {
            dispatch(removeBookmark(id));
        }
    }

    if (!mounted) {
        return null;
    }

    return (
        <aside className={`
        fixed left-0 h-full p-4 bg-white shadow-lg z-50
        flex flex-col gap-4
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-20"} overflow-hidden
        bg-white
        `}>
            <div className="flex justify-end mr-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 bg-blue-500 rounded text-white shrink-0"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>
            <div className="flex flex-col gap-2">
                {bookmarks.map((item: Bookmark) => (
                    <div className={`fav_list flex justify-between ${!isOpen ? 'group' : ''}`}
                        key={item.id}>
                        <a className={`fav flex flex-1 items-center gap-2 ${isOpen ? 'hover:bg-gray-100' : ''} p-1 rounded h-10`}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className={`IcoBg fixed shrink-0 p-1 ${!isOpen ? 'group-hover:bg-gray-200 rounded transition-colors' : ''}`}
                            >
                                <img className="w-8 h-8" src={item.icon} alt={item.title} onError={(e) => { e.currentTarget.src = 'https://www.google.com/favicon.ico' }} />
                            </div>
                            <p className="tit whitespace-nowrap ml-15">{item.title}</p>
                        </a>
                        <button
                            onClick={(e) => handleRemove(e, item.id)}
                            className="group addFav flex justify-center items-center gap-2 hover:bg-red-400 p-2 rounded transition-colors "
                        >
                            <MinusIcon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors " />
                        </button>
                    </div>
                ))}
                <AddFav />
            </div>
        </aside>
    )
}