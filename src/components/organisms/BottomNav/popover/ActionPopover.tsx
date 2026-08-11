import { PopoverType } from "@/type/popover";
import { useLayoutEffect, useState } from "react";
import Popover from "@/util/Popover";
import TodoInput from "../../../molecules/todo/TodoInput";
import MemoInput from "../../../molecules/memo/MemoInput";
import ItemList from "../../../molecules/shared/ItemList";

interface ActionPopoverProps {
    name: PopoverType;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}

export default function ActionPopover({ name, onClose, anchorEl }: ActionPopoverProps) {
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(() => anchorEl?.getBoundingClientRect() || null);

    useLayoutEffect(() => {
        setAnchorRect(anchorEl?.getBoundingClientRect() || null);
    }, [anchorEl]);

    if (!name || !anchorRect) return null;

    return (
        <Popover
            isOpen={!!name}
            onClose={onClose}
            anchorRect={anchorRect}
            width={480}
            placement="top"
        >
            <div className="flex flex-col rounded-[24px] overflow-hidden glass border border-black/50 dark:border-white/20 shadow-xl w-full">
                {/* 헤더 영역 */}
                <div className="px-5 py-3 bg-white/10 border-b border-black/50 dark:border-white/10">
                    <h3 className="text-sm font-bold text-title">
                        {name === 'todo' ? '할 일 관리' : '메모장'}
                    </h3>
                </div>

                {/* 입력 영역 */}
                <div className="px-4 py-3 bg-white/5">
                    {name === 'todo' ? <TodoInput /> : <MemoInput />}
                </div>

                {/* 리스트 영역 */}
                <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
                    <ItemList kind={name} />
                </div>
            </div>
        </Popover>
    )
}
