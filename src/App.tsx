import Main from './components/organisms/Main/MainContainer';
import ListPersistence from './component/ListPersistence';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import { useEffect, useRef } from 'react';
import { supabase } from './config/supabase';
import { loadBookmarksFromStorage } from './thunk/bookmarkThunk';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { loadListFromStorage } from './thunk/listThunk';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, _session) => {
      //로그아웃시 새로고침
      if (event === 'SIGNED_OUT') {
        window.location.reload();
        return
      }

      await Promise.all([
        dispatch(loadBookmarksFromStorage()).unwrap(),
        dispatch(loadListFromStorage()).unwrap()
      ]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <>
      <ListPersistence />
      <div className='dashboard-bg' />
      <div className='relative min-h-dvh'>
        <Main />
        <footer aria-hidden="true" className="sr-only"></footer>
      </div>
    </>
  );
}
