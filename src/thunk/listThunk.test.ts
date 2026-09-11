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

        await loadListFromStorage(undefined)(vi.fn(), () => {}, undefined);

        expect(chromeStorage.get).toHaveBeenCalledWith('guest_list_items');
    });

    it('로그인되었을 때 userId가 포함된 키를 사용해야 함', async () => {
        const userId = 'user-123';
        (supabase.auth.getSession as any).mockResolvedValue({ data: { session: { user: { id: userId } } } });
        (chromeStorage.get as any).mockResolvedValue(null);

        await loadListFromStorage(userId)(vi.fn(), () => {}, undefined);

        expect(chromeStorage.get).toHaveBeenCalledWith(`${userId}_list_items`);
    });

    it('로그인 시 사용자 키가 비어있고 게스트 데이터가 있으면 게스트 데이터를 마이그레이션해야 함', async () => {
        const userId = 'user-123';
        const guestData = { items: [{ id: 1, kind: 'todo', text: '게스트 할일', date: '2026-09-11' }], nextId: 2 };

        (chromeStorage.get as any).mockImplementation((key: string) => {
            if (key === `${userId}_list_items`) return Promise.resolve(null);
            if (key === 'guest_list_items') return Promise.resolve(guestData);
            return Promise.resolve(null);
        });

        const result = await loadListFromStorage(userId)(vi.fn(), () => {}, undefined);

        expect(chromeStorage.set).toHaveBeenCalledWith(`${userId}_list_items`, guestData);
        expect(result.payload).toEqual(guestData);
    });
});
