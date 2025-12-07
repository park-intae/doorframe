import { ModalType } from "app/type/modal"

interface MenuesProps {
    onOpenModal: (name: ModalType) => void
}

export default function Menus({ onOpenModal }: MenuesProps) {
    return (
        <div className='menus mx-5 flex flex-row gap-3'>
            <button className="memo p-1 border rounded-lg" onClick={() => onOpenModal('memo')}>memo</button>
            <button className="todo p-1 border rounded-lg" onClick={() => onOpenModal('todo')}>todo</button>
        </div>
    )
}