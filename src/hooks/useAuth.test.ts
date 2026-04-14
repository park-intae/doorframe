import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { supabase } from '@/config/supabase';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

// 1. Supabase 모킹
vi.mock('@/config/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            signInWithOAuth: vi.fn(),
            signInAnonymously: vi.fn(),
            signOut: vi.fn(),
        }
    }
}));

describe('useAuth 훅 테스트', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('초기에는 로딩 상태여야 함', () => {
        (supabase.auth.getSession as Mock).mockResolvedValue({ data: { session: null } });
        (supabase.auth.signInAnonymously as Mock).mockResolvedValue({ data: { user: null } });
        const { result } = renderHook(() => useAuth());
        expect(result.current.loading).toBe(true);
    });

    it('세션 로드 성공 시 로딩이 끝나고 유저가 설정되어야 함', async () => {
        const mockUser = { id: '123' };
        (supabase.auth.getSession as Mock).mockResolvedValue({ data: { session: { user: mockUser } } });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
    });

    it('세션이 없으면 익명 로그인을 시도해야 함', async () => {
        // 1. 시뮬레이션: 세션이 없는 상황
        (supabase.auth.getSession as Mock).mockResolvedValue({ data: { session: null } });
        
        // 2. signInAnonymously를 Promise 객체로 저장하여 해결 대기
        let resolveAnon: any;
        const anonPromise = new Promise((resolve) => { resolveAnon = resolve; });
        (supabase.auth.signInAnonymously as Mock).mockReturnValue(anonPromise);
        
        (supabase.auth.onAuthStateChange as Mock).mockReturnValue({ 
            data: { subscription: { unsubscribe: vi.fn() } } 
        });

        // 3. 훅 실행
        renderHook(() => useAuth());

        // 4. 익명 로그인이 호출될 때까지 대기
        await waitFor(() => {
            expect(supabase.auth.signInAnonymously).toHaveBeenCalled();
        }, { timeout: 2000 });
        
        // 5. 해결
        resolveAnon({ data: { user: { id: 'anon_123' } } });
    });
});
