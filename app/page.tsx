import Image from 'next/image';
import Login from './component/header/Login';
import FavBar from './component/favBar/FavBar';
import Bottom from './component/bottom/Bottom';
import MainSec from './component/container/subcomponents/MainSec';

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
        <FavBar />
        <MainSec />
        <Bottom />
      </main>
      <footer></footer>
    </div>
  );
}
