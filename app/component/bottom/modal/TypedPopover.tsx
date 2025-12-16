import { PopoverType } from "app/type/popover";
import TodoPopover from "./TodoPopover";
import MemoPopover from "./MemoPopover";
import { useEffect, useRef, useState } from "react";
import Popover from "app/util/popover";

interface TypedPopoverProps {
    name: PopoverType;
    onClose: () => void;
    anchorRect?: DOMRect | null;
}

export default function TypedPopover({ name, onClose, anchorRect }: TypedPopoverProps) {
    // const popoverRef = useRef<HTMLDivElement>(null);
    // const [position, setPosition] = useState({ bottom: 0, left: 0 });

    // useEffect(() => {
    //     if (name && popoverRef.current && anchorRect) {
    //         const popoverWidth = 320; // w-80 = 320px

    //         let bottom = window.innerHeight - anchorRect.top + 5;
    //         let left = anchorRect.left + (anchorRect.width / 2) - (popoverWidth / 2);

    //         if (left < 10) {
    //             left = 10
    //         }

    //         if (left + popoverWidth > window.innerWidth - 10) {
    //             left = window.innerWidth - popoverWidth - 10;
    //         }

    //         setPosition({
    //             bottom, left
    //         });
    //     }
    // }, [name, anchorRect]);

    // const handleClose = () => {
    //     onClose();
    // }

    // // 백드롭 클릭 시 닫기
    // const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    //     if (e.target === e.currentTarget) {
    //         handleClose();
    //     }
    // }

    if (!name) return null;

    return (
        <Popover
            isOpen={!!name}
            onClose={onClose}
            anchorRect={anchorRect}
            width={320}
            placement="top"
        >
            {/* <div>
                {name === 'memo' && <MemoPopover />}
                {name === 'memo' && <TodoPopover />}
            </div> */}
            <div className="content flex justify-center flex-col border rounded-lg py-5">
                {name === 'memo' && (
                    <>
                        <div>Rendering MemoModal</div>
                        <MemoPopover />
                    </>
                )}
                {name === 'todo' && (
                    <>
                        <div>Rendering TodoModal</div>
                        <TodoPopover />
                    </>
                )}
                {name !== 'memo' && name !== 'todo' && (
                    <div>Unknown popover type: {name}</div>
                )}
            </div>
        </Popover>
    )
}