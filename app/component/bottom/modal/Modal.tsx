import { ModalType } from "app/type/modal";
import TodoModal from "./TodoPopover";
import MemoModal from "./MemoPopover";
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