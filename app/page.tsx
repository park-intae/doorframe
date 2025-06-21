import React from 'react';
import Login from './component/container/subcomponents/login';
import Image from 'next/image';
import SideBar from './component/sidebar/sidebar';
import Today from './component/container/subcomponents/today';
import Weather from './component/container/subcomponents/weather';

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
        <section className='container'>
          <Today />
          <Weather />
        </section>
        <SideBar />
      </main>
      <footer></footer>
    </div>
  );
}
