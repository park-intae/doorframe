import { ModalType } from "app/type/modal";
import TodoModal from "./TodoModal";
import MemoModal from "./MemoModal";
import { useEffect, useRef } from "react";

interface ModalProps {
    name: ModalType;
    onClose: () => void;
}

export default function Modal({ name, onClose }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (name && dialogRef.current && !dialogRef.current.open) {
            dialogRef.current.showModal();
        }
    }, [name]);

    const handleClose = () => {
        if (dialogRef.current?.open) {
            dialogRef.current.close();
        }
        onClose();
    }

    if (!name) return null;

    return (
        <>
            <div className="modal-backdrop">
                <dialog ref={dialogRef} className="modal" >
                    {name === 'memo' && <MemoModal />}
                    {name === 'todo' && <TodoModal />}
                    <button onClick={handleClose}>닫기</button>
                </dialog>
            </div>
        </>
    )
}