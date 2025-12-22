import Header from './component/Header';
import Main from './component/container/Main';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-l from-[rgb(var(--color-background-sub)/1)] via-white via-50% to-white">
      <Header />
      <hr />
      <Main />
      <footer></footer>
    </div>
  );
}
