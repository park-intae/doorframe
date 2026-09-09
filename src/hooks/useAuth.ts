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
                        // 사용자가 창을 닫거나 취소한 경우 정상 취소로 처리 (영문/한글 메시지 대응)
                        if (
                            message.includes('The user did not approve') ||
                            message.includes('closed by the user') ||
                            message.includes('User cancelled') ||
                            message.includes('사용자가') ||
                            message.includes('닫았습니다') ||
                            message.includes('닫혔습니다')
                        ) {
                            resolve(undefined);
                            return;
                        }
                        reject(new Error(`[인증 창 오류] ${message}`));
                        return;
                    }
                    if (!responseUrl) {
                        resolve(undefined);
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

                if (error) throw new Error(`[Supabase OAuth 요청 실패] ${error.message}`);
                if (!data?.url) throw new Error('인증 URL을 생성하지 못했습니다.');

                const responseUrl = await launchWebAuthFlowAsync(data.url);
                if (!responseUrl) {
                    // 사용자가 팝업을 닫음
                    return;
                }

                const url = new URL(responseUrl);
                // OAuth 에러 파라미터 확인
                const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
                const errorParam = url.searchParams.get('error') || hashParams.get('error');
                const errorDesc = url.searchParams.get('error_description') || hashParams.get('error_description');
                if (errorParam) {
                    throw new Error(`[인증 거부: ${errorParam}] ${errorDesc || ''}`);
                }

                const code = url.searchParams.get('code');

                if (code) {
                    // PKCE 코드 교환
                    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) throw new Error(`[세션 코드 교환 실패] ${exchangeError.message}`);
                    if (sessionData.session?.user) {
                        dispatch(setUser(sessionData.session.user));
                        dispatch(loadBookmarksFromStorage(sessionData.session.user.id));
                        dispatch(loadListFromStorage(sessionData.session.user.id));
                    }
                } else {
                    // Implicit / Hash 토큰 교환
                    const accessToken = hashParams.get('access_token');
                    const refreshToken = hashParams.get('refresh_token');

                    if (accessToken && refreshToken) {
                        const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                        if (setSessionError) throw new Error(`[세션 설정 실패] ${setSessionError.message}`);
                        if (sessionData.session?.user) {
                            dispatch(setUser(sessionData.session.user));
                            dispatch(loadBookmarksFromStorage(sessionData.session.user.id));
                            dispatch(loadListFromStorage(sessionData.session.user.id));
                        }
                    } else {
                        throw new Error(`인증 응답에서 토큰이나 코드를 찾을 수 없습니다.\n수신 URL: ${responseUrl}`);
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
        } catch (error: any) {
            console.error('로그인 에러:', error);
            alert(`로그인에 실패했습니다.\n\n오류 내용: ${error?.message || error || '알 수 없는 오류'}`);
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
