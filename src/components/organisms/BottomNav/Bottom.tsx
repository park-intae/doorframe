import Menus from "./Menus"
import { usePopover } from "@/hooks/usePopover";
import ActionPopover from "./popover/ActionPopover";

export default function Bottom() {
    const { popoverName, anchorEl, handleOpenPopover, handleClosePopover } = usePopover();

    return (
        <section className='botSec self-end pb-3'>
            <Menus onOpenPopover={handleOpenPopover} />
            <ActionPopover
                name={popoverName}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
            />
        </section>
    )
}