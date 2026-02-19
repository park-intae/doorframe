import Header from './component/Header';
import Main from './component/container/Main';
import ListPersistence from './component/ListPersistence';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import { useEffect } from 'react';
import { supabase } from './config/supabase';
import { loadBookmarksFromStorage } from './thunk/bookmarkThunk';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { loadListFromStorage } from './thunk/listThunk';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      //로그아웃시 새로고침
      if (event === 'SIGNED_OUT') {
        window.location.reload();
        return
      }

      dispatch(loadBookmarksFromStorage());
      dispatch(loadListFromStorage());
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <>
      <ListPersistence />
      <div className="flex flex-1 flex-col h-full box-border">
        <Header />
        <hr />
        <Main />
        <footer></footer>
      </div>
    </>
  );
}
