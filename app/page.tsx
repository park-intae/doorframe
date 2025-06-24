import React from 'react';
import Image from 'next/image';
import SideBar from './component/sidebar/sidebar';
import Login from './component/container/subcomponents/Login';
import Container from './component/Container';

export default function Home() {
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
        <div className="search_bar"></div>
        <Container />
        <SideBar />
      </main>
      <footer></footer>
    </div>
  );
}
