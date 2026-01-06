

import { RootState } from "@/store";
import { Bookmark } from "@/type/bookmark";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Menu, MinusIcon, X } from "lucide-react";
import AddFav from "./favBar/AddFav";
import { loadBookmarksFromStorage, saveBookmarksToStorage } from "@/thunk/bookmarkThunk";
import { useAppDispatch } from "@/store/hooks";
import { removeBookmark, setBookmarks } from "@/store/slice/bookmarkSlice";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableBookmarkItem({
    item,
    isOpen,
    onRemove
}: {
    item: Bookmark;
    isOpen: boolean;
    onRemove: (e: React.MouseEvent, id: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`fav_list flex ${!isOpen ? 'group' : 'justify-between'}`}
        >
            {isOpen && (
                <div
                    {...attributes}
                    {...listeners}
                    className="flex justify-center items-center cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                >
                    <Menu className="grapBar w-4 h-4 text-gray-400" />
                </div>
            )}

            <a
                className={`fav flex items-center gap-2 ${isOpen ? 'hover:bg-gray-100 flex-1' : ''} p-1 rounded`}
                href={item.url}
                target="_blank"
                rel="nooper noreferrer">
                <div className="IcoBg shrink-0 w-10 h-10 items-center justify-center p-1 rounded transition-colors group-hover:bg-gray-200">
                    <img
                        className="w-8 h-8"
                        src={item.icon}
                        alt={item.title}
                        onError={(e) => { e.currentTarget.src = 'https://www.google.com/favicon.icon' }}
                    />
                </div>
                {isOpen && <p className="tit whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</p>}
            </a>

            {isOpen && (
                <button
                    onClick={(e) => onRemove(e, item.id)}
                    className="group addFav flex shrink-0 justify-center items-center hover:bg-red-400"
                >
                    <MinusIcon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </button>
            )}
        </div>
    )
}

export default function FavBar() {
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const isInitialMount = useRef(true);

    const bookmarks = useSelector((state: RootState) => state.bookmarks);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setMounted(true);
        dispatch(loadBookmarksFromStorage());
    }, [dispatch]);

    useEffect(() => {
        if (!mounted) return;

        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        console.log('💾 데이터 변경 감지 - 저장 수행:', bookmarks);
        dispatch(saveBookmarksToStorage(bookmarks));

    }, [bookmarks, mounted, dispatch]);

    const handleRemove = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('북마크를 삭제하시겠습니까')) {
            dispatch(removeBookmark(id));
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = bookmarks.findIndex((b) => b.id === active.id);
            const newIndex = bookmarks.findIndex((b) => b.id === over.id);

            const newBookmarks = arrayMove(bookmarks, oldIndex, newIndex);
            console.log('북마크 순서 변경:', newBookmarks);
            dispatch(setBookmarks(newBookmarks));
        }
    };

    if (!mounted) {
        return null;
    };

    return (
        <aside className={`
        fixed left-0 h-full p-4 bg-white shadow-lg z-50
        flex flex-col gap-4
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-20"} overflow-hidden
        `}>
            <div className="flex justify-end mr-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 bg-blue-500 rounded text-white shrink-0"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={bookmarks.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2">
                        {bookmarks.map((item) => (
                            <SortableBookmarkItem
                                key={item.id}
                                item={item}
                                isOpen={isOpen}
                                onRemove={handleRemove}
                            />
                        ))}
                        <AddFav />
                    </div>
                </SortableContext>
            </DndContext>
        </aside>
    )
}