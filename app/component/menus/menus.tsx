export default function Menus({ onOpenModal }) {
    return (
        <div className='menus'>
            <button className="memo" onClick={() => onOpenModal('memo')}>memo</button>
            <button className="todo" onClick={() => onOpenModal('todo')}>todo</button>
        </div>
    )
}