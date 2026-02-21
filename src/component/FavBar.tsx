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
                    className="flex justify-center items-center cursor-grab active:cursor-grabbing p-1 hover:bg-background rounded"
                >
                    <Menu className="grapBar w-4 h-4 text-context" />
                </div>
            )}

            <a
                className={`fav flex items-center gap-2 ${isOpen ? 'hover:bg-background flex-1' : ''} p-1 rounded`}
                href={item.url}
                target="_blank"
                rel="nooper noreferrer">
                <div className="IcoBg shrink-0 w-10 h-10 items-center justify-center p-1 rounded transition-colors group-hover:bg-background">
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
                    <MinusIcon className="w-5 h-5 text-context group-hover:text-main transition-colors" />
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
            dispatch(setBookmarks(newBookmarks));
        }
    };

    if (!mounted) {
        return null;
    };

    return (
        <aside className={`absolute top-0 left-0 z-10
        p-4 h-full bg-white shadow-lg
        flex flex-col gap-4
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-20"} overflow-hidden
        glass
        `}>
            <div className="flex justify-end mr-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 bg-point rounded text-main shrink-0"
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