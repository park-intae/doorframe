import TodoModal from "./TodoModal";
import MemoModal from "./MemoModal";
import { useEffect, useRef, useState } from "react";
import { PopoverType } from "app/type/popover";

interface ModalProps {
    name: PopoverType;
    onClose: () => void;
    anchor?: HTMLElement | null;
}

export default function Popover({ name, onClose, anchor }: ModalProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (name && popoverRef.current && anchor) {
            const rect = anchor.getBoundingClientRect();
            const popoverHeight = 400;
            const popoverWidth = 320;

            setPosition({
                top: rect.top - popoverHeight - 10,
                left: rect.left + (rect.width / 2) - (popoverWidth / 2)
            });
        }
    }, [name, anchor]);

    const handleClose = () => {
        onClose();
    }

    const handleBackdropClic = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }

    if (!name) return null;

    return (
        <>
            <div className="modal-backdrop">
                <dialog ref={dialogRef} className="modal m-auto min-h-30 w-80 p-3 rounded-lg flex flex-col justify-center gap-3">
                    <div className="content flex justify-center flex flex-col border rounded-lg py-5">
                        {name === 'memo' && <MemoModal />}
                        {name === 'todo' && <TodoModal />}
                    </div>
                    <button onClick={handleClose} className="self-end">닫기</button>
                </dialog>
            </div>
        </>
    )
}