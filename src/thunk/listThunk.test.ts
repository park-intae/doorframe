import { vi, describe, it, expect, beforeEach } from 'vitest';
import { loadListFromStorage, saveListToStorage } from './listThunk';
import { supabase } from '@/config/supabase';
import { chromeStorage } from '@/util/chromeStorage';

// 모킹
vi.mock('@/config/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
        }
    }
}));

vi.mock('@/util/chromeStorage', () => ({
    chromeStorage: {
        get: vi.fn(),
        set: vi.fn(),
    }
}));

describe('listThunk 로그인 분기 테스트', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('로그인되지 않았을 때 guest 키를 사용해야 함', async () => {
        (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });
        (chromeStorage.get as any).mockResolvedValue(null);

        await loadListFromStorage()(vi.fn(), () => {}, undefined);

        expect(chromeStorage.get).toHaveBeenCalledWith('guest_list_items');
    });

    it('로그인되었을 때 userId가 포함된 키를 사용해야 함', async () => {
        const userId = 'user-123';
        (supabase.auth.getSession as any).mockResolvedValue({ data: { session: { user: { id: userId } } } });
        (chromeStorage.get as any).mockResolvedValue(null);

        await loadListFromStorage()(vi.fn(), () => {}, undefined);

        expect(chromeStorage.get).toHaveBeenCalledWith(`${userId}_list_items`);
    });
});
