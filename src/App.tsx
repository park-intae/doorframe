import Main from './components/organisms/Main/MainContainer';
import ListPersistence from './component/ListPersistence';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import { useEffect } from 'react';
import { supabase } from './config/supabase';
import { loadBookmarksFromStorage } from './thunk/bookmarkThunk';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { loadListFromStorage } from './thunk/listThunk';
import { setUser, setLoading } from './store/slice/authSlice';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  useTheme(); // 테마 적용 훅 호출

  useEffect(() => {
    // 초기 세션 확인
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          dispatch(setUser(session.user));
          dispatch(loadBookmarksFromStorage(session.user.id));
          dispatch(loadListFromStorage(session.user.id));
          return;
        }

        // 익명 로그인 시도 (세션이 없을 때만)
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data?.user) {
          dispatch(setUser(data.user));
          dispatch(loadBookmarksFromStorage(data.user.id));
          dispatch(loadListFromStorage(data.user.id));
        } else {
          dispatch(setUser(null));
          dispatch(loadBookmarksFromStorage(undefined));
          dispatch(loadListFromStorage(undefined));
        }
      } catch (err) {
        dispatch(setUser(null));
        dispatch(loadBookmarksFromStorage(undefined));
        dispatch(loadListFromStorage(undefined));
      } finally {
        dispatch(setLoading(false));
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      //로그아웃시 새로고침
      if (event === 'SIGNED_OUT') {
        window.location.reload();
        return;
      }

      if (session) {
        dispatch(setUser(session.user));
        dispatch(loadBookmarksFromStorage(session.user.id));
        dispatch(loadListFromStorage(session.user.id));
      } else {
        dispatch(setUser(null));
        dispatch(loadBookmarksFromStorage(undefined));
        dispatch(loadListFromStorage(undefined));
      }
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
