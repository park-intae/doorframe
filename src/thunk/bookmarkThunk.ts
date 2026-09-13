import { createAsyncThunk } from '@reduxjs/toolkit';
import { Bookmark } from '@/type/bookmark';
import { chromeStorage } from '@/util/chromeStorage';

const BASE_STORAGE_KEY = 'fav_items';

const getUserStorageKey = (userId?: string) => userId ? `${userId}_${BASE_STORAGE_KEY}` : `guest_${BASE_STORAGE_KEY}`;

const defaultBookmarks: Bookmark[] = [
  {
    id: 1,
    icon: 'https://www.google.com/favicon.ico',
    title: 'Google',
    url: 'https://www.google.com/',
  },
  {
    id: 2,
    icon: 'https://www.naver.com/favicon.ico',
    title: 'Naver',
    url: 'https://www.naver.com/',
  },
];

export const saveBookmarksToStorage = createAsyncThunk<void, { bookmarks: Bookmark[]; userId?: string }>(
  'bookmarks/save',
  async ({ bookmarks, userId }) => {
    const key = getUserStorageKey(userId);
    await chromeStorage.set(key, bookmarks);
  }
);

export const loadBookmarksFromStorage = createAsyncThunk<Bookmark[], string | undefined>('bookmarks/load',
  async (userId) => {
    const key = getUserStorageKey(userId);
    const stored = await chromeStorage.get<Bookmark[]>(key);

    if (stored === undefined || stored === null) {
      // 로그인 사용자 키에 데이터가 없는 경우 기존 게스트 북마크가 있는지 확인하여 자동 마이그레이션
      if (userId) {
        const guestKey = getUserStorageKey(undefined);
        const guestStored = await chromeStorage.get<Bookmark[]>(guestKey);
        if (guestStored && guestStored.length > 0) {
          await chromeStorage.set(key, guestStored);
          return guestStored;
        }
      }

      await chromeStorage.set(key, defaultBookmarks);
      return defaultBookmarks;
    }

    return stored;
  });