import React from 'react';
import Login from './component/container/subcomponents/login';
import Image from 'next/image';
import Container from './component/container/container';
import SideBar from './component/sidebar/sidebar';

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
        <SideBar />
      </main>
      <footer></footer>
    </div>
  );
}
