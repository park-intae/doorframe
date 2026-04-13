import { renderHook, waitFor } from '@testing-library/react';
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
});
