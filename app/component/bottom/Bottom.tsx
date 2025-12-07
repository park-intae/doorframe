'use client'

import { useDispatch, useSelector } from "react-redux";
import Menus from "./Menus"
import Popover from "./modal/Popover";
import { RootState } from "app/store";
import { closePopover, openPopover } from "app/store/slice/popoverSlice";
import { PopoverType } from "app/type/popover";

export default function Bottom() {
    const dispatch = useDispatch();
    const popoverName = useSelector((state: RootState) => state.popover.name);

    const handleOpenPopover = (name: PopoverType) =>
        (e: React.MouseEvent<HTMLElement>) => {
            const anchor = e.currentTarget as HTMLElement;
            dispatch(openPopover({ name, anchor, }));
        };
    const handleClosePopover = () => { dispatch(closePopover()); };

    return (
        <section className='botSec self-end'>
            <Menus onOpenPopover={handleOpenPopover} />
            <Popover name={popoverName} onClose={handleClosePopover} />
        </section>
    )
}