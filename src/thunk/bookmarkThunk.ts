import { createAsyncThunk } from '@reduxjs/toolkit';
import { Bookmark } from '@/type/bookmark';
import { chromeStorage } from '@/util/chromeStorage';
import { supabase } from '@/config/supabase';

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

export const saveBookmarksToStorage = createAsyncThunk<void, Bookmark[]>(
  'bookmarks/save',
  async (bookmarks) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const key = getUserStorageKey(userId);
    await chromeStorage.set(key, bookmarks);
  }
);

export const loadBookmarksFromStorage = createAsyncThunk<Bookmark[], void>('bookmarks/load',
  async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const key = getUserStorageKey(userId)
    const stored = await chromeStorage.get<Bookmark[]>(key);

    if (stored === undefined || stored === null) {
      await chromeStorage.set(key, defaultBookmarks);
      return defaultBookmarks;
    }

    return stored;
  });