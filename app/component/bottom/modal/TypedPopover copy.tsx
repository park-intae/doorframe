import { PopoverType } from "app/type/popover";
import TodoPopover from "./TodoPopover";
import MemoPopover from "./MemoPopover";
import { useEffect, useRef, useState } from "react";

interface PopoverProps {
    name: PopoverType;
    onClose: () => void;
    anchorRect?: DOMRect | null;
}

export default function TypedPopover({ name, onClose, anchorRect }: PopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ bottom: 0, left: 0 });

    useEffect(() => {
        if (name && popoverRef.current && anchorRect) {
            const popoverWidth = 320; // w-80 = 320px

            let bottom = window.innerHeight - anchorRect.top + 5;
            let left = anchorRect.left + (anchorRect.width / 2) - (popoverWidth / 2);

            if (left < 10) {
                left = 10
            }

            if (left + popoverWidth > window.innerWidth - 10) {
                left = window.innerWidth - popoverWidth - 10;
            }

            setPosition({
                bottom, left
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
                    bottom: `${position.bottom}px`,
                    left: `${position.left}px`,
                }}
            >
                <div className="content flex justify-center flex-col border rounded-lg py-5">
                    {name === 'memo' && <MemoPopover />}
                    {name === 'todo' && <TodoPopover />}
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