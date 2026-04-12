import Menus from "./Menus"
import { usePopover } from "@/hooks/usePopover";
import ActionPopover from "./popover/ActionPopover";

export default function Bottom() {
    const { popoverName, anchorEl, handleOpenPopover, handleClosePopover } = usePopover();

    return (
        <footer aria-label="하단 메뉴" className='botSec self-end pb-3 w-full flex justify-end'>
            <Menus onOpenPopover={handleOpenPopover} />
            <ActionPopover
                name={popoverName}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
            />
        </footer>
    )
}