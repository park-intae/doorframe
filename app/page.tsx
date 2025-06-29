import Image from 'next/image';
import Login from './component/header/Login';
import Container from './component/container/Container';
import Search from './component/container/subcomponents/Search';
import FavBar from './component/favBar/FavBar';
import Bottom from './component/bottom/Bottom';

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
        <section className='fav'>
          <FavBar />
        </section>
        <section className='mainSec'>
          <Search />
          <Container />
        </section>
        <Bottom />
      </main>
      <footer></footer>
    </div>
  );
}
