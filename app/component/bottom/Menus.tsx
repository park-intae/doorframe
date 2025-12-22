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
                className="memo p-1 border rounded-full bg-sub-back"
                onClick={() => {
                    onOpenPopover('memo');
                }}
            >
                <img src="/note.svg" className="w-8 h-8" />
            </button>
            <button
                ref={(el) => {
                    buttonRefs.current['todo'] = el;
                }}
                className="todo p-1 border rounded-full bg-sub-back"
                onClick={() => {
                    onOpenPopover('todo')
                }}
            >
                <img src="/list.svg" className="w-8 h-8" />
            </button>
        </div>
    )
}