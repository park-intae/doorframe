import { PopoverType } from "app/type/popover"

interface MenuesProps {
    onOpenPopover: (name: PopoverType) => void
}

export default function Menus({ onOpenPopover }: MenuesProps) {
    return (
        <div className='menus mx-5 flex flex-row gap-3'>
            <button className="memo p-1 border rounded-lg" onClick={() => onOpenPopover('memo')}>memo</button>
            <button className="todo p-1 border rounded-lg" onClick={() => onOpenPopover('todo')}>todo</button>
        </div>
    )
}