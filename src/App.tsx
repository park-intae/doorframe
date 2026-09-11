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
    let isMounted = true;

    // 세션 및 유저 프로필 처리 함수
    const handleSession = async (session: any) => {
      if (!isMounted) return;

      try {
        // 실제 로그인 사용자(!is_anonymous)인 경우에만 Redux 전역 유저로 등록
        if (session?.user && !session.user.is_anonymous) {
          let currentUser = session.user;

          // 만약 로컬 세션 캐시에 user_metadata가 불완전하다면 서버에서 최신 유저 정보 보강
          if (!currentUser.user_metadata || Object.keys(currentUser.user_metadata).length === 0) {
            try {
              const { data: userData, error } = await supabase.auth.getUser();
              if (!error && userData?.user) {
                currentUser = userData.user;
              }
            } catch {
              // 네트워크 실패 시 기존 세션 유저 유지
            }
          }

          dispatch(setUser(currentUser));
          dispatch(loadBookmarksFromStorage(currentUser.id));
          dispatch(loadListFromStorage(currentUser.id));
        } else {
          // 비로그인이거나 익명 세션인 경우:
          // 1. Redux 상에서는 게스트(null)로 처리하여 껍데기 프로필 노출 방지
          dispatch(setUser(null));
          // 2. 스토리지 키는 임의의 익명 UUID가 아닌 안정적인 고정 guest_ 키 사용
          dispatch(loadBookmarksFromStorage(undefined));
          dispatch(loadListFromStorage(undefined));

          // 3. 세션이 아예 없는 경우 파비콘 업로드 등 백엔드 Storage API를 위해 백그라운드 익명 세션 확보
          if (!session) {
            try {
              await supabase.auth.signInAnonymously();
            } catch {
              // 익명 로그인 실패 시에도 로컬 게스트 모드는 정상 동작
            }
          }
        }
      } catch (err) {
        console.error('세션 초기화 실패:', err);
        dispatch(setUser(null));
        dispatch(loadBookmarksFromStorage(undefined));
        dispatch(loadListFromStorage(undefined));
      } finally {
        if (isMounted) {
          dispatch(setLoading(false));
        }
      }
    };

    // 1. 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    }).catch(() => {
      handleSession(null);
    });

    // 2. 인증 상태 변화 감지 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      // 로그아웃 시 새로고침
      if (event === 'SIGNED_OUT') {
        window.location.reload();
        return;
      }

      // 로그인, 토큰 갱신, 유저 정보 갱신 이벤트 발생 시 세션 재반영
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        handleSession(session);
      }
    });

    return () => {
      isMounted = false;
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
