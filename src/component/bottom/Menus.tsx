import { PopoverType } from "@/type/popover"
import { MutableRefObject } from "react"

interface MenuesProps {
    onOpenPopover: (name: PopoverType) => void
    buttonRefs: MutableRefObject<{ [key: string]: HTMLButtonElement | null }>
}

export default function Menus({ onOpenPopover, buttonRefs }: MenuesProps) {

    return (
        <div className='menus mx-5 flex flex-row gap-3'>
            {[
                { key: 'memo', icon: '/note.svg' },
                { key: 'todo', icon: '/list.svg' },
            ].map(({ key, icon }) => (
                <button
                    key={key}
                    ref={(el) => {
                        buttonRefs.current[key] = el;
                    }}
                    className="todo p-1 rounded-full glass-button flex justify-center items-center w-11 hover:brightness-95 transition-colors"
                    onClick={() => {
                        onOpenPopover(key as PopoverType)
                    }}
                >
                    <img src={icon} className="w-8 h-8" />
                </button>
            ))
            }
        </div>
    )
}