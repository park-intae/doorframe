import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { supabase } from '@/config/supabase';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setUser } from '@/store/slice/authSlice';
import bookmarkReducer from '@/store/slice/bookmarkSlice';
import listReducer from '@/store/slice/listSlice';
import { User } from '@supabase/supabase-js';

// Supabase 모킹
vi.mock('@/config/supabase', () => ({
    supabase: {
        auth: {
            signInWithOAuth: vi.fn(),
            signOut: vi.fn(),
            exchangeCodeForSession: vi.fn(),
            setSession: vi.fn(),
        }
    }
}));

describe('useAuth 훅 테스트', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        delete (global as any).chrome;
    });

    afterEach(() => {
        delete (global as any).chrome;
    });

    const createTestStore = (initialUser: User | null = null, initialLoading: boolean = true) => {
        return configureStore({
            reducer: {
                auth: authReducer,
                bookmarks: bookmarkReducer,
                list: listReducer,
            },
            preloadedState: {
                auth: {
                    user: initialUser,
                    loading: initialLoading,
                }
            }
        });
    };

    const createWrapper = (store: ReturnType<typeof createTestStore>) => {
        return ({ children }: { children: React.ReactNode }) =>
            React.createElement(Provider, { store }, children);
    };

    it('스토어의 초기 상태(로딩 중)를 올바르게 반환해야 함', () => {
        const store = createTestStore(null, true);
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(store) });
        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBeNull();
    });

    it('스토어에 유저가 설정되면 유저 정보와 로딩 종료 상태를 반환해야 함', () => {
        const mockUser = { id: 'user-123', email: 'test@example.com' } as unknown as User;
        const store = createTestStore(null, true);
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(store) });

        act(() => {
            store.dispatch(setUser(mockUser));
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
    });

    it('웹 브라우저 환경에서 handleGoogleSignIn 호출 시 supabase.auth.signInWithOAuth를 호출해야 함', async () => {
        (supabase.auth.signInWithOAuth as Mock).mockResolvedValue({ error: null });
        const store = createTestStore();
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(store) });

        await act(async () => {
            await result.current.handleGoogleSignIn();
        });

        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(expect.objectContaining({
            provider: 'google'
        }));
    });

    it('로그인 실패 시 alert를 띄워야 함', async () => {
        (supabase.auth.signInWithOAuth as Mock).mockRejectedValue(new Error('로그인 실패 에러'));
        const store = createTestStore();
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(store) });

        await act(async () => {
            await result.current.handleGoogleSignIn();
        });

        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('로그인에 실패했습니다.'));
    });

    it('크롬 확장 프로그램 환경에서 PKCE 인증 흐름이 정상 처리되어야 함', async () => {
        let updatedListener: any;

        (global as any).chrome = {
            runtime: { getURL: () => 'chrome-extension://test-id/index.html' },
            tabs: {
                create: vi.fn(async () => {
                    setTimeout(() => {
                        updatedListener?.(101, {
                            url: 'chrome-extension://test-id/index.html?code=sample_pkce_code',
                        });
                    }, 10);
                    return { id: 101 };
                }),
                remove: vi.fn(async () => {}),
                onUpdated: {
                    addListener: (fn: any) => { updatedListener = fn; },
                    removeListener: vi.fn(),
                },
                onRemoved: {
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                },
            },
        };

        (supabase.auth.signInWithOAuth as Mock).mockResolvedValue({
            data: { url: 'https://accounts.google.com/oauth' },
            error: null,
        });

        (supabase.auth.exchangeCodeForSession as Mock).mockResolvedValue({
            data: { session: { user: { id: 'u101', email: 'pkce@test.com' } } },
            error: null,
        });

        const store = createTestStore();
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(store) });

        await act(async () => {
            await result.current.handleGoogleSignIn();
        });

        expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('sample_pkce_code');
        expect(store.getState().auth.user?.id).toBe('u101');
    });

    it('크롬 확장 프로그램 환경에서 해시 토큰(access_token) 인증 흐름이 정상 처리되어야 함', async () => {
        let updatedListener: any;

        (global as any).chrome = {
            runtime: { getURL: () => 'chrome-extension://test-id/index.html' },
            tabs: {
                create: vi.fn(async () => {
                    setTimeout(() => {
                        updatedListener?.(102, {
                            url: 'chrome-extension://test-id/index.html#access_token=at123&refresh_token=rt123',
                        });
                    }, 10);
                    return { id: 102 };
                }),
                remove: vi.fn(async () => {}),
                onUpdated: {
                    addListener: (fn: any) => { updatedListener = fn; },
                    removeListener: vi.fn(),
                },
                onRemoved: {
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                },
            },
        };

        (supabase.auth.signInWithOAuth as Mock).mockResolvedValue({
            data: { url: 'https://accounts.google.com/oauth' },
            error: null,
        });

        (supabase.auth.setSession as Mock).mockResolvedValue({
            data: { session: { user: { id: 'u102', email: 'hash@test.com' } } },
            error: null,
        });

        const store = createTestStore();
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(store) });

        await act(async () => {
            await result.current.handleGoogleSignIn();
        });

        expect(supabase.auth.setSession).toHaveBeenCalledWith({
            access_token: 'at123',
            refresh_token: 'rt123',
        });
        expect(store.getState().auth.user?.id).toBe('u102');
    });

    it('크롬 확장 프로그램 환경에서 탭이 닫혔을 때 resolve 처리되어야 함', async () => {
        let removedListener: any;

        (global as any).chrome = {
            runtime: { getURL: () => 'chrome-extension://test-id/index.html' },
            tabs: {
                create: vi.fn(async () => {
                    setTimeout(() => {
                        removedListener?.(103);
                    }, 10);
                    return { id: 103 };
                }),
                remove: vi.fn(async () => {}),
                onUpdated: {
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                },
                onRemoved: {
                    addListener: (fn: any) => { removedListener = fn; },
                    removeListener: vi.fn(),
                },
            },
        };

        (supabase.auth.signInWithOAuth as Mock).mockResolvedValue({
            data: { url: 'https://accounts.google.com/oauth' },
            error: null,
        });

        const store = createTestStore();
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(store) });

        await act(async () => {
            await result.current.handleGoogleSignIn();
        });

        expect(result.current.isSigningIn).toBe(false);
    });

    it('handleSignOut 호출 시 supabase.auth.signOut을 호출해야 함', async () => {
        (supabase.auth.signOut as Mock).mockResolvedValue({ error: null });
        const store = createTestStore();
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(store) });

        await act(async () => {
            await result.current.handleSignOut();
        });

        expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('handleSignOut 실패 시 콘솔 에러를 출력하고 크래시되지 않아야 함', async () => {
        (supabase.auth.signOut as Mock).mockRejectedValue(new Error('로그아웃 에러'));
        const store = createTestStore();
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(store) });

        await act(async () => {
            await result.current.handleSignOut();
        });

        expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('handleOpenPopover 및 setShowPopover 상태를 올바르게 제어해야 함', () => {
        const store = createTestStore();
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(store) });

        expect(result.current.showPopover).toBe(false);

        act(() => {
            result.current.handleOpenPopover();
        });
        expect(result.current.showPopover).toBe(true);

        act(() => {
            result.current.setShowPopover(false);
        });
        expect(result.current.showPopover).toBe(false);
    });
});
