import { ChevronLeft, ChevronRight } from "lucide-react";
import AddFav from "./BookmarkAdd";
import {
    DndContext,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useFavBar } from "@/hooks/useFavBar";
import { SortableBookmarkItem } from "./SortableBookmarkItem";

export default function BookmarkBar() {
    const {
        isOpen,
        setIsOpen,
        mounted,
        bookmarks,
        sensors,
        handleRemove,
        handleDragEnd
    } = useFavBar();

    if (!mounted) {
        return null;
    };

    return (
        <>
            <aside className={`absolute top-0 left-0 z-10 p-4 h-full bg-white shadow-lg flex
                flex-col gap-4 transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-20"} overflow-hidden glass`}>
                <div className="relative h-10">
                </div>
                <hr className="w-full" />
                <div className={`flex ${isOpen ? 'justify-end' : 'justify-center'}`}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1.5 rounded-lg text-context hover:text-point hover:bg-point/10 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                        aria-label={isOpen ? "사이드바 접기" : "사이드바 펼치기"}
                        title={isOpen ? "사이드바 접기" : "사이드바 펼치기"}
                    >
                        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
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
            <div className="absolute flex item-center justify-center w-20">
                    <img
                    src={`${import.meta.env.BASE_URL}images/logo.webp`}
                    alt="DoorFrame 로고"
                    width={35}
                    height={40}
                    className='absolute z-[88] top-4 transition-all duration-300 ease-in-out left-6 object-contain'
                    fetchpriority="high"
                    loading="eager"
                />
            </div>
        </>
    )
}
