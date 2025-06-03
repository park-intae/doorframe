import React from 'react';
import Login from './component/login';

export default function Home() {
  return (
    <div>
      <header>
        {/* <img ></img> 로고 들어올 공간~ */}
        <Login />
      </header>
      <hr />
      <main>
        <div className="search_bar"></div>
        <div className="container">
          <div className="DT">
            <div className="date"></div>
            <div className="time"></div>
          </div>
          <div className="weather">
            <div className="weatherIco"></div>
            <div className="weatehrTxt">
              <div className="temper"></div>
              <div className="state"></div>
              <div className="region"></div>
            </div>
          </div>
          <div className="fav">
            <div className="IcoBg">{/* <img/> 즐찾 아이콘*/}</div>
            <p className="tit"></p>
            <span className="desc"></span>
          </div>
        </div>
      </main>
      <footer></footer>
    </div>
  );
}
