'use client'

import { useDispatch, useSelector } from "react-redux";
import Menus from "./Menus"
import Modal from "./modal/Modal"
import { RootState } from "app/store";
import { closeModal, openModal } from "app/store/slice/modalSlice";

export default function Bottom() {
    const dispatch = useDispatch();
    const modalName = useSelector((state: RootState) => state.modal.name);

    const handleOpenModal = (name: typeof modalName) => { dispatch(openModal(name)); };
    const handleCloseModal = () => { dispatch(closeModal()); };

    return (
        <section className='botSec'>
            <Menus onOpenModal={handleOpenModal} />
            <Modal name={modalName} onClose={handleCloseModal} />
        </section>
    )
}