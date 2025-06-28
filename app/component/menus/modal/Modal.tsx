import { ModalType } from "app/type/modal";
import TodoModal from "./TodoModal";
import MemoModal from "./MemoModal";

interface ModalProps {
    name: ModalType;
    onClose: () => void;
}

export default function Modal({ name, onClose }: ModalProps) {
    return (
        <>
            <div className="modal-backdrop">
                <dialog className="modal">
                    {name === 'memo' && <TodoModal />}
                    {name === 'todo' && <MemoModal />}
                    <button>닫기</button>
                </dialog>
            </div>
        </>
    )
}