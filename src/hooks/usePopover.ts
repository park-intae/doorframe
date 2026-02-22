import { PopoverType } from "@/type/popover";
import { useState } from "react";

export function usePopover() {
    const [popoverName, setPopoverName] = useState<PopoverType>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleOpenPopover = (name: PopoverType, target: HTMLButtonElement) => {
        if (!name || !target) return;
        setPopoverName(name);
        setAnchorEl(target);
    };

    const handleClosePopover = () => {
        setPopoverName(null);
        setAnchorEl(null);
    };

    return {
        popoverName,
        anchorEl,
        handleOpenPopover,
        handleClosePopover
    }
}
