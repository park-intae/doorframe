import Header from './component/Header';
import Main from './component/container/Main';

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <hr />
      <Main />
      <footer></footer>
    </div>
  );
}
