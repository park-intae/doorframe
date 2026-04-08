import { PopoverType } from "@/type/popover"

interface MenusProps {
    onOpenPopover: (name: PopoverType, target: HTMLButtonElement) => void
}

export default function Menus({ onOpenPopover }: MenusProps) {
    return (
        <div className='menus mx-5 flex flex-row gap-3'>
            {[
                { key: 'memo', icon: '/note.svg' },
                { key: 'todo', icon: '/list.svg' },
            ].map(({ key, icon }) => (
                <button
                    key={key}
                    className="todo p-1 rounded-full glass-button flex justify-center items-center w-11 hover:brightness-95 transition-colors"
                    onClick={(e) => {
                        onOpenPopover(key as PopoverType, e.currentTarget)
                    }}
                >
                    <img src={icon} className="w-8 h-8" />
                </button>
            ))
            }
        </div>
    )
}