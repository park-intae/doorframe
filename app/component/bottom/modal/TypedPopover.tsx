import { PopoverType } from "app/type/popover";
import TodoPopover from "./TodoPopover";
import MemoPopover from "./MemoPopover";
import { useEffect, useRef, useState } from "react";
import Popover from "app/util/Popover";

interface TypedPopoverProps {
    name: PopoverType;
    onClose: () => void;
    anchorRect?: DOMRect | null;
}

export default function TypedPopover({ name, onClose, anchorRect }: TypedPopoverProps) {
    console.log('Popover 렌더링:', { name, anchorRect });

    if (!name || !anchorRect) return null;

    return (
        <Popover
            isOpen={!!name}
            onClose={onClose}
            anchorRect={anchorRect}
            width={320}
            placement="top"
        >
            <div className="content flex justify-center flex-col rounded-lg py-5 max-h-85 bg-white">
                {name === 'memo' &&
                    <MemoPopover />
                }
                {name === 'todo' &&
                    <TodoPopover />
                }
            </div>
        </Popover>
    )
}