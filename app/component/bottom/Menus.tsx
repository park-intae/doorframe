import { ModalType } from "app/type/modal"

interface MenuesProps {
    onOpenModal: (name: ModalType) => void
}

export default function Menus({ onOpenModal }: MenuesProps) {
    return (
        <div className='menus'>
            <button className="memo" onClick={() => onOpenModal('memo')}>memo</button>
            <button className="todo" onClick={() => onOpenModal('todo')}>todo</button>
        </div>
    )
}