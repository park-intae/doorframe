import { PopoverType } from "app/type/popover"
import { MutableRefObject } from "react"

interface MenuesProps {
    onOpenPopover: (name: PopoverType) => void
    buttonRefs: MutableRefObject<{ [key: string]: HTMLButtonElement | null }>
}

export default function Menus({ onOpenPopover, buttonRefs }: MenuesProps) {

    return (
        <div className='menus mx-5 flex flex-row gap-3'>
            <button
                ref={(el) => {
                    buttonRefs.current['memo'] = el;
                }}
                className="memo p-1 border rounded-lg"
                onClick={() => {
                    onOpenPopover('memo');
                }}
            >
                memo
            </button>
            <button
                ref={(el) => {
                    buttonRefs.current['todo'] = el;
                }}
                className="todo p-1 border rounded-lg"
                onClick={() => {
                    onOpenPopover('todo')
                }}
            >
                todo
            </button>
        </div>
    )
}