import Main from './component/container/Main';
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
  const dashboardRef = useRef<HTMLDivElement>(null); //디버그용

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

  useEffect(() => {
    const logLayoutInfo = () => {
      console.log("===== Layout Debug =====");
      console.log("window.innerHeight:", window.innerHeight);
      console.log("document.documentElement.clientHeight:", document.documentElement.clientHeight);
      console.log("window.outerHeight:", window.outerHeight);
      console.log("visualViewport.height:", window.visualViewport?.height);
      console.log("dashboard actual height:", dashboardRef.current?.getBoundingClientRect().height);
      console.log("========================");
    };

    logLayoutInfo();
    window.addEventListener('resize', logLayoutInfo);

    return () => {
      window.removeEventListener('resize', logLayoutInfo);
    };
  }, []);

  return (
    <>
      <ListPersistence />
      <div className='dashboard-bg'>
        <div className='relative min-h-dvh'>
          <Main />
          <footer></footer>
        </div>
      </div>
    </>
  );
}
