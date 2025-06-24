import React, { useState } from 'react';
import Image from 'next/image';
import Login from './component/header/Login';
import Container from './component/container/Container';
import Search from './component/container/subcomponents/Search';
import FavBar from './component/favBar/FavBar';
import Menus from './component/menus/Menus';
import Modal from './component/menus/modal/Modal';

export default function Home() {
  type ModalType = 'todo' | 'memo' | null;
  const [modalName, setModalName] = useState<ModalType>(null);

  const openModal = (name: ModalType) => setModalName(name);
  const closeModal = () => setModalName(null);

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
