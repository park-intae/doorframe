import { PopoverType } from "app/type/popover";
import TodoModal from "./TodoModal";
import MemoModal from "./MemoModal";
import { useEffect, useRef, useState } from "react";

interface PopoverProps {
    name: PopoverType;
    onClose: () => void;
    anchorRect?: DOMRect | null;
}

export default function Popover({ name, onClose, anchorRect }: PopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (name && popoverRef.current && anchorRect) {
            const popoverHeight = 400; // 예상 높이
            const popoverWidth = 320; // w-80 = 320px

            let top = anchorRect.top - popoverHeight + 220;
            let left = anchorRect.left + (anchorRect.width / 2) - (popoverWidth / 2);

            if (left < 10) {
                left = 10
            }

            if (left + popoverWidth > window.innerWidth - 10) {
                left = window.innerWidth - popoverWidth - 10;
            }

            // 앵커 위쪽에 표시 (bottom 메뉴이므로)
            setPosition({
                top, left
            });
        }
    }, [name, anchorRect]);

    const handleClose = () => {
        onClose();
    }

    // 백드롭 클릭 시 닫기
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }

    if (!name) return null;

    return (
        <div
            className="fixed inset-0 z-50"
            onClick={handleBackdropClick}
        >
            <div
                ref={popoverRef}
                className="absolute bg-white min-h-30 w-80 p-3 rounded-lg flex flex-col justify-center gap-3 shadow-2xl border"
                style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                }}
            >
                <div className="content flex justify-center flex-col border rounded-lg py-5">
                    {name === 'memo' && <MemoModal />}
                    {name === 'todo' && <TodoModal />}
                </div>
                <button
                    onClick={handleClose}
                    className="self-end px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                    닫기
                </button>
            </div>
        </div>
    )
}