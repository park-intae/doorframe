import { Bookmark } from "@/type/bookmark";
import { Menu, MinusIcon } from "lucide-react";
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableBookmarkItem({
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
                    className="group addFav flex shrink-0 justify-center items-center hover:bg-red-400 focus:outline-none"
                    aria-label={`${item.title} 북마크 삭제`}
                >
                    <MinusIcon className="w-5 h-5 text-context group-hover:text-main transition-colors" aria-hidden="true" />
                </button>
            )}
        </div>
    )
}
