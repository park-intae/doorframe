import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { supabase } from '@/config/supabase';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setUser } from '@/store/slice/authSlice';
import { User } from '@supabase/supabase-js';

// 1. Supabase 모킹
vi.mock('@/config/supabase', () => ({
    supabase: {
        auth: {
            signInWithOAuth: vi.fn(),
            signOut: vi.fn(),
        }
    }
}));

describe('useAuth 훅 테스트', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createTestStore = (initialUser: User | null = null, initialLoading: boolean = true) => {
        return configureStore({
            reducer: {
                auth: authReducer,
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

    it('handleGoogleSignIn 호출 시 supabase.auth.signInWithOAuth를 호출해야 함', async () => {
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

    it('handleSignOut 호출 시 supabase.auth.signOut을 호출해야 함', async () => {
        (supabase.auth.signOut as Mock).mockResolvedValue({ error: null });
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
