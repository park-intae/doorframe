import Providers from './providers/Provider';
import Header from './component/Header';
import Main from './component/container/Main';
import ListPersistence from './component/ListPersistence';

export default function Home() {
  return (
    <Providers>
      <ListPersistence />
      <div className="flex flex-1 flex-col h-screen">
        <Header />
        <hr />
        <Main />
        <footer></footer>
      </div>
    </Providers>
  );
}
