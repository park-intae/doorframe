import { vi, describe, it, expect, beforeEach } from 'vitest';
import { loadBookmarksFromStorage, saveBookmarksToStorage } from './bookmarkThunk';
import { chromeStorage } from '@/util/chromeStorage';

vi.mock('@/util/chromeStorage', () => ({
    chromeStorage: {
        get: vi.fn(),
        set: vi.fn(),
    }
}));

describe('bookmarkThunk 테스트', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('비로그인(undefined)일 때 guest_fav_items 키를 조회해야 함', async () => {
        (chromeStorage.get as any).mockResolvedValue(null);

        const result = await loadBookmarksFromStorage(undefined)(vi.fn(), () => {}, undefined);

        expect(chromeStorage.get).toHaveBeenCalledWith('guest_fav_items');
        expect(chromeStorage.set).toHaveBeenCalledWith('guest_fav_items', expect.any(Array));
        expect((result.payload as any[]).length).toBe(2);
    });

    it('로그인 시 사용자 키가 비어있고 게스트 북마크가 있으면 게스트 북마크를 마이그레이션해야 함', async () => {
        const userId = 'user-abc';
        const guestBookmarks = [
            { id: 1, title: '내 북마크', url: 'https://example.com', icon: 'https://example.com/favicon.ico' }
        ];

        (chromeStorage.get as any).mockImplementation((key: string) => {
            if (key === `${userId}_fav_items`) return Promise.resolve(null);
            if (key === 'guest_fav_items') return Promise.resolve(guestBookmarks);
            return Promise.resolve(null);
        });

        const result = await loadBookmarksFromStorage(userId)(vi.fn(), () => {}, undefined);

        expect(chromeStorage.set).toHaveBeenCalledWith(`${userId}_fav_items`, guestBookmarks);
        expect(result.payload).toEqual(guestBookmarks);
    });

    it('saveBookmarksToStorage 호출 시 지정된 유저 키에 저장해야 함', async () => {
        const userId = 'user-abc';
        const bookmarks = [{ id: 1, title: '구글', url: 'https://google.com', icon: '' }];

        await saveBookmarksToStorage({ bookmarks, userId })(vi.fn(), () => {}, undefined);

        expect(chromeStorage.set).toHaveBeenCalledWith(`${userId}_fav_items`, bookmarks);
    });
});
