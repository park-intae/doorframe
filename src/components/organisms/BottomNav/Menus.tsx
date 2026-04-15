import { PopoverType } from "@/type/popover"

interface MenusProps {
    onOpenPopover: (name: PopoverType, target: HTMLButtonElement) => void
}

export default function Menus({ onOpenPopover }: MenusProps) {
    return (
        <div className='menus mx-5 flex flex-row gap-3 justify-end'>
            {[
                { key: 'memo', icon: '/images/note.svg' },
                { key: 'todo', icon: '/images/list.svg' },
            ].map(({ key, icon }) => (
                <button
                    key={key}
                    className="todo p-1 rounded-full glass-button flex justify-center items-center w-11 hover:brightness-95 transition-colors"
                    onClick={(e) => {
                        onOpenPopover(key as PopoverType, e.currentTarget)
                    }}
                    aria-label={key === 'memo' ? '메모 작성' : '할 일 목록'}
                >
                    <img src={icon} alt="" aria-hidden="true" className="w-8 h-8" />
                </button>
            ))
            }
        </div>
    )
}