import { useDispatch, useSelector } from 'react-redux';
import { closeModal, openModal } from './store/modalSlice';
import { RootState } from './store';

import Image from 'next/image';
import Login from './component/header/Login';
import Container from './component/container/Container';
import Search from './component/container/subcomponents/Search';
import FavBar from './component/favBar/FavBar';
import Menus from './component/menus/Menus';
import Modal from './component/menus/modal/Modal';

export default function Home() {
  const dispatch = useDispatch();
  const modalName = useSelector((state: RootState) => state.modal.name);

  const handleOpenModal = (name: typeof modalName) => dispatch(openModal(name));
  const handleCloseModal = () => dispatch(closeModal());
  return (
    <div>
      <header>
        <Image
          src="/logo.png"
          alt='로고'
          width={35}
          height={40}
        />
        <Login />
      </header>
      <hr />
      <main>
        <section className='fav'>
          <FavBar />
        </section>
        <section className='mainSec'>
          <Search />
          <Container />
        </section>
        <section className='botSec'>
          <Menus onOpenModal={openModal} />
          <Modal name={modalName} onClose={closeModal} />
        </section>
      </main>
      <footer></footer>
    </div>
  );
}
