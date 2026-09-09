import { supabase } from '@/config/supabase';
import { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setUser } from '@/store/slice/authSlice';
import { loadBookmarksFromStorage } from '@/thunk/bookmarkThunk';
import { loadListFromStorage } from '@/thunk/listThunk';

export function useAuth() {
    const dispatch = useDispatch<AppDispatch>();
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const [showPopover, setShowPopover] = useState(false);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const launchWebAuthFlowAsync = (url: string): Promise<string | undefined> => {
        return new Promise((resolve, reject) => {
            chrome.identity.launchWebAuthFlow(
                { url, interactive: true },
                (responseUrl) => {
                    if (chrome.runtime?.lastError) {
                        const message = chrome.runtime.lastError.message || '';
                        // 사용자가 로그인 팝업을 직접 닫은 경우 예외가 아닌 정상 취소로 처리
                        if (
                            message.includes('The user did not approve') ||
                            message.includes('closed by the user') ||
                            message.includes('User cancelled')
                        ) {
                            resolve(undefined);
                            return;
                        }
                        reject(new Error(message));
                        return;
                    }
                    resolve(responseUrl);
                }
            );
        });
    };

    const handleGoogleSignIn = async () => {
        try {
            const isChromeExtension = typeof chrome !== 'undefined' && !!chrome.identity?.launchWebAuthFlow;

            if (isChromeExtension) {
                const redirectUrl = chrome.identity.getRedirectURL();

                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: redirectUrl,
                        skipBrowserRedirect: true,
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'select_account',
                        },
                    }
                });

                if (error) throw error;
                if (!data?.url) throw new Error('인증 URL을 가져오지 못했습니다.');

                const responseUrl = await launchWebAuthFlowAsync(data.url);
                if (!responseUrl) {
                    // 사용자가 팝업을 닫음
                    return;
                }

                const url = new URL(responseUrl);
                const code = url.searchParams.get('code');

                if (code) {
                    // PKCE 코드 교환
                    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) throw exchangeError;
                    if (sessionData.session?.user) {
                        dispatch(setUser(sessionData.session.user));
                        dispatch(loadBookmarksFromStorage(sessionData.session.user.id));
                        dispatch(loadListFromStorage(sessionData.session.user.id));
                    }
                } else {
                    // Implicit / Hash 토큰 교환
                    const hash = url.hash.startsWith('#') ? url.hash.substring(1) : url.hash;
                    const params = new URLSearchParams(hash);
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken && refreshToken) {
                        const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                        if (setSessionError) throw setSessionError;
                        if (sessionData.session?.user) {
                            dispatch(setUser(sessionData.session.user));
                            dispatch(loadBookmarksFromStorage(sessionData.session.user.id));
                            dispatch(loadListFromStorage(sessionData.session.user.id));
                        }
                    }
                }

                setShowPopover(false);
            } else {
                // 웹 브라우저 환경 폴백
                const redirectTo = window.location.origin.endsWith('/')
                    ? window.location.origin
                    : `${window.location.origin}/`;

                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: redirectTo,
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'select_account',
                        },
                    }
                });

                if (error) throw error;
                setShowPopover(false);
            }
        } catch (error) {
            console.error('로그인 에러:', error);
            alert('로그인에 실패했습니다.');
        }
    };

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setShowPopover(false);
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    const handleOpenPopover = () => {
        if (buttonRef.current) {
            setAnchorRect(buttonRef.current.getBoundingClientRect());
        }
        setShowPopover(true);
    };

    return {
        user,
        loading,
        showPopover,
        anchorRect,
        buttonRef,
        setShowPopover,
        handleGoogleSignIn,
        handleSignOut,
        handleOpenPopover
    };
}
