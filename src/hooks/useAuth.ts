import { supabase } from '@/config/supabase';
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setUser } from '@/store/slice/authSlice';
import { loadBookmarksFromStorage } from '@/thunk/bookmarkThunk';
import { loadListFromStorage } from '@/thunk/listThunk';
import { User } from '@supabase/supabase-js';

const GOOGLE_CLIENT_ID = '636198045097-3gh22uidcqu9nlletsptk4680dv6bthp.apps.googleusercontent.com';
const MANUAL_SIGNOUT_KEY = 'doorframe_manual_signout';

export function useAuth() {
    const dispatch = useDispatch<AppDispatch>();
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const [showPopover, setShowPopover] = useState(false);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const isSigningInRef = useRef(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const hasAttemptedSilentSignInRef = useRef(false);

    // 사용자 인증 성공 시 전역 스토어 및 스토리지 동기화
    const syncUserSession = (authenticatedUser: User) => {
        dispatch(setUser(authenticatedUser));
        dispatch(loadBookmarksFromStorage(authenticatedUser.id));
        dispatch(loadListFromStorage(authenticatedUser.id));
    };

    // [핵심 기능 1: 크롬 브라우저 계정 무팝업(Silent) 백그라운드 자동 연동]
    useEffect(() => {
        if (loading || user || hasAttemptedSilentSignInRef.current) return;
        hasAttemptedSilentSignInRef.current = true;

        const attemptSilentSignIn = async () => {
            const isManualSignOut = localStorage.getItem(MANUAL_SIGNOUT_KEY) === 'true';
            if (isManualSignOut) return;

            const isChromeExtension = typeof chrome !== 'undefined' && !!chrome.identity?.launchWebAuthFlow;
            if (!isChromeExtension) return;

            try {
                const redirectUri = chrome.identity.getRedirectURL
                    ? chrome.identity.getRedirectURL()
                    : `https://${chrome.runtime?.id}.chromiumapp.org/`;
                const nonce = Math.random().toString(36).substring(2);
                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=id_token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20email%20profile&nonce=${nonce}`;

                const callbackUrl = await new Promise<string>((resolve, reject) => {
                    chrome.identity.launchWebAuthFlow(
                        { url: authUrl, interactive: false },
                        (responseUrl) => {
                            if (chrome.runtime.lastError || !responseUrl) {
                                reject(chrome.runtime.lastError || new Error('Silent auth unavailable'));
                            } else {
                                resolve(responseUrl);
                            }
                        }
                    );
                });

                if (callbackUrl) {
                    const parsedUrl = new URL(callbackUrl);
                    const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
                    const idToken = hashParams.get('id_token');

                    if (idToken) {
                        const { data, error } = await (supabase.auth as any).signInWithIdToken({
                            provider: 'google',
                            token: idToken,
                        });

                        if (!error && data?.session?.user) {
                            syncUserSession(data.session.user);
                        }
                    }
                }
            } catch {
                // 브라우저 미로그인 또는 자동 연동 불가 시 게스트 모드 유지
            }
        };

        attemptSilentSignIn();
    }, [loading, user]);

    // [핵심 기능 2: 크롬 브라우저 계정 로그아웃 감지 동기화]
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.identity?.onSignInChanged) {
            const handleSignInChange = (_account: unknown, signedIn: boolean) => {
                if (!signedIn && user) {
                    supabase.auth.signOut().then(() => {
                        dispatch(setUser(null));
                    }).catch(() => {
                        // 로그아웃 동기화 실패 시 무시
                    });
                }
            };

            chrome.identity.onSignInChanged.addListener(handleSignInChange);
            return () => {
                if (typeof chrome !== 'undefined' && chrome.identity?.onSignInChanged) {
                    chrome.identity.onSignInChanged.removeListener(handleSignInChange);
                }
            };
        }
    }, [user, dispatch]);

    // [핵심 기능 3: 수동 로그인 (창 2번 뜨는 문제 없는 단 1회의 깔끔한 로그인)]
    const handleGoogleSignIn = async () => {
        if (isSigningInRef.current) return;
        isSigningInRef.current = true;
        setIsSigningIn(true);

        localStorage.removeItem(MANUAL_SIGNOUT_KEY);

        try {
            const isChromeExtension = typeof chrome !== 'undefined' && !!chrome.tabs?.create;

            if (isChromeExtension) {
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

                const loginTab = await chrome.tabs.create({ url: data.url });
                const loginTabId = loginTab.id;

                if (!loginTabId) {
                    throw new Error('로그인 탭을 열 수 없습니다.');
                }

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
                            resolve();
                        }
                    };

                    const onUpdatedListener = async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
                        if (tabId !== loginTabId || !changeInfo.url) return;

                        try {
                            const currentUrl = new URL(changeInfo.url);

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
                                    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                                    if (exchangeError) throw new Error(`[세션 코드 교환 실패] ${exchangeError.message}`);
                                    if (sessionData.session?.user) {
                                        syncUserSession(sessionData.session.user);
                                    }
                                } else {
                                    const accessToken = hashParams.get('access_token');
                                    const refreshToken = hashParams.get('refresh_token');

                                    if (accessToken && refreshToken) {
                                        const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
                                            access_token: accessToken,
                                            refresh_token: refreshToken,
                                        });
                                        if (setSessionError) throw new Error(`[세션 설정 실패] ${setSessionError.message}`);
                                        if (sessionData.session?.user) {
                                            syncUserSession(sessionData.session.user);
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
                const redirectTo = window.location.href.split('?')[0].split('#')[0];

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
            alert(`로그인에 실패했습니다.\n\n오류 내용: ${error?.message || error || '알 수 없는 오류'}`);
        } finally {
            isSigningInRef.current = false;
            setIsSigningIn(false);
        }
    };

    const handleSignOut = async () => {
        try {
            localStorage.setItem(MANUAL_SIGNOUT_KEY, 'true');

            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setShowPopover(false);
        } catch {
            // 로그아웃 실패 시 무시
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
