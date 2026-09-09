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

    const isSigningInRef = useRef(false);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleGoogleSignIn = async () => {
        if (isSigningInRef.current) return;
        isSigningInRef.current = true;
        setIsSigningIn(true);

        try {
            const isChromeExtension = typeof chrome !== 'undefined' && !!chrome.tabs?.create;

            if (isChromeExtension) {
                // 확장 프로그램의 실제 내부 index.html 주소를 명시적으로 리디렉션 주소로 지정
                const redirectUrl = chrome.runtime.getURL('index.html');

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

                if (error) throw new Error(`[OAuth 요청 실패] ${error.message}`);
                if (!data?.url) throw new Error('인증 URL을 생성하지 못했습니다.');

                // 새 브라우저 탭으로 구글 로그인 열기 (웹뷰 차단 회피)
                const loginTab = await chrome.tabs.create({ url: data.url });
                const loginTabId = loginTab.id;

                if (!loginTabId) {
                    throw new Error('로그인 탭을 열 수 없습니다.');
                }

                // 탭 URL 변경 감지 리스너
                await new Promise<void>((resolve, reject) => {
                    let cleanedUp = false;

                    const cleanup = () => {
                        if (cleanedUp) return;
                        cleanedUp = true;
                        chrome.tabs.onUpdated.removeListener(onUpdatedListener);
                        chrome.tabs.onRemoved.removeListener(onRemovedListener);
                    };

                    const onRemovedListener = (tabId: number) => {
                        if (tabId === loginTabId) {
                            cleanup();
                            resolve(); // 사용자가 탭을 닫음 (정상 취소)
                        }
                    };

                    const onUpdatedListener = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
                        if (tabId !== loginTabId || !changeInfo.url) return;

                        try {
                            const currentUrl = new URL(changeInfo.url);

                            // 콜백 URL의 실제 origin에 도달하고 인증 파라미터가 있는지 엄격히 검사
                            // (chrome-extension://, localhost, 127.0.0.1, chromiumapp.org 모두 코드 단위에서 완벽 포착)
                            const isCallbackOrigin =
                                currentUrl.protocol === 'chrome-extension:' ||
                                currentUrl.hostname === 'localhost' ||
                                currentUrl.hostname === '127.0.0.1' ||
                                currentUrl.hostname.endsWith('.chromiumapp.org');

                            const hasAuthPayload =
                                currentUrl.searchParams.has('code') ||
                                currentUrl.searchParams.has('error') ||
                                currentUrl.hash.includes('access_token') ||
                                currentUrl.hash.includes('error');

                            if (isCallbackOrigin && hasAuthPayload) {
                                cleanup();
                                try {
                                    // 로그인 완료 탭 자동 닫기
                                    await chrome.tabs.remove(loginTabId);
                                } catch {}

                                const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ''));
                                const errorParam = currentUrl.searchParams.get('error') || hashParams.get('error');
                                const errorDesc = currentUrl.searchParams.get('error_description') || hashParams.get('error_description');

                                if (errorParam) {
                                    throw new Error(`[인증 거부: ${errorParam}] ${errorDesc || ''}`);
                                }

                                const code = currentUrl.searchParams.get('code');

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
                                    }
                                }

                                setShowPopover(false);
                                resolve();
                            }
                        } catch (err) {
                            cleanup();
                            reject(err);
                        }
                    };

                    chrome.tabs.onUpdated.addListener(onUpdatedListener);
                    chrome.tabs.onRemoved.addListener(onRemovedListener);
                });
            } else {
                // 일반 웹 브라우저 환경 폴백
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
        } finally {
            isSigningInRef.current = false;
            setIsSigningIn(false);
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
        isSigningIn,
        showPopover,
        anchorRect,
        buttonRef,
        setShowPopover,
        handleGoogleSignIn,
        handleSignOut,
        handleOpenPopover
    };
}
