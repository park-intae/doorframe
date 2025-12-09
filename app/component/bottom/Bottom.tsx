'use client'

import { useDispatch, useSelector } from "react-redux";
import Menus from "./Menus"
import Popover from "./modal/Popover";
import { RootState } from "app/store";
import { closePopover, openPopover } from "app/store/slice/popoverSlice";
import { PopoverType } from "app/type/popover";
import { useRef } from "react";

export default function Bottom() {
    const dispatch = useDispatch();
    const popoverName = useSelector((state: RootState) => state.popover.name);
    const anchorRect = useSelector((state: RootState) => state.popover.anchorRect);
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    console.log('=== Bottom Component ===');
    console.log('popoverName from Redux:', popoverName);
    console.log('anchorRect from Redux:', anchorRect);

    const handleOpenPopover = (name: PopoverType) => {
        if (!name) return;

        const anchor = buttonRefs.current[name];
        console.log('handleOpenPopover called - name:', name);
        console.log('handleOpenPopover - anchor:', anchor);
        if (anchor) {
            dispatch(openPopover({ name, anchor }));
        } else {
            console.log('anchor is null!');
        }
    };
    const handleClosePopover = () => { dispatch(closePopover()); };

    return (
        <section className='botSec self-end'>
            <Menus onOpenPopover={handleOpenPopover} buttonRefs={buttonRefs} />
            <Popover name={popoverName} anchorRect={anchorRect} onClose={handleClosePopover} />
        </section>
    )
}