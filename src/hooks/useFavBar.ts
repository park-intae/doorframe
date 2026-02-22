import { RootState } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
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
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

export function useFavBar() {
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

    return {
        isOpen,
        setIsOpen,
        mounted,
        bookmarks,
        sensors,
        handleRemove,
        handleDragEnd
    }
}
