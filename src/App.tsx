import Header from './component/Header';
import Main from './component/container/Main';
import ListPersistence from './component/ListPersistence';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import { useEffect } from 'react';
import { supabase } from './config/supabase';
import { loadBookmarksFromStorage } from './thunk/bookmarkThunk';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔔 [Auth Event]:", _event);
      console.log("👤 [Current User]:", session?.user?.id || "비로그인");
      dispatch(loadBookmarksFromStorage());
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <>
      <ListPersistence />
      <div className="flex flex-1 flex-col h-screen">
        <Header />
        <hr />
        <Main />
        <footer></footer>
      </div>
    </>
  );
}
