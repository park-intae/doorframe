import { useDispatch, useSelector } from "react-redux";
import Menus from "./Menus"
import TypedPopover from "./popover/TypedPopover";
import { RootState } from "@/store";
import { closePopover, openPopover } from "@/store/slice/popoverSlice";
import { PopoverType } from "@/type/popover";
import { useRef } from "react";

export default function Bottom() {
    const dispatch = useDispatch();
    const popoverName = useSelector((state: RootState) => state.popover.name);
    const anchorRect = useSelector((state: RootState) => state.popover.anchorRect);
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    const handleOpenPopover = (name: PopoverType) => {
        if (!name) return;

        const anchor = buttonRefs.current[name];
        if (anchor) {
            dispatch(openPopover({ name, anchor }));
        } else {
            console.log('anchor 탐색 불가');
        }
    };
    const handleClosePopover = () => { dispatch(closePopover()); };

    return (
        <section className='botSec self-end py-5'>
            <Menus onOpenPopover={handleOpenPopover} buttonRefs={buttonRefs} />
            <TypedPopover name={popoverName} anchorRect={anchorRect} onClose={handleClosePopover} />
        </section>
    )
}