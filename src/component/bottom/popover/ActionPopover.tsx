import { PopoverType } from "@/type/popover";
import { useEffect, useRef, useState } from "react";
import Popover from "@/util/Popover";
import Input from "./Input";
import List from "./List";

interface ActionPopoverProps {
    name: PopoverType;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}

export default function ActionPopover({ name, onClose, anchorEl }: ActionPopoverProps) {
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (anchorEl) {
            setAnchorRect(anchorEl.getBoundingClientRect());
        } else {
            setAnchorRect(null);
        }
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
            <div className="content flex justify-center flex-col rounded-lg py-5 max-h-85 glass-input">
                <Input kind={name} />
                <List kind={name} />
            </div>
        </Popover>
    )
}
