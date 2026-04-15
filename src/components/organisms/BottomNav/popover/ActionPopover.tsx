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
            width={320}
            placement="top"
        >
            <div className="content flex justify-center flex-col rounded-[20px] py-5 max-h-85 glass-input !bg-white/60">
                {name === 'todo' ? <TodoInput /> : <MemoInput />}
                <ItemList kind={name} />
            </div>
        </Popover>
    )
}
