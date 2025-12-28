import { createAsyncThunk } from '@reduxjs/toolkit';
import { Bookmark } from 'app/type/bookmark';
import { chromeStorage } from 'app/util/chromeStorage';

const STORAGE_KEY = 'fav_items';

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

export const loadBookmarksFromStorage = createAsyncThunk<Bookmark[]>('bookmarks/load', async () => {
  const stored = await chromeStorage.get<Bookmark[]>(STORAGE_KEY);

  if (stored === undefined || stored === null || (Array.isArray(stored) && stored.length === 0)) {
    await chromeStorage.set(STORAGE_KEY, defaultBookmarks);
    return defaultBookmarks;
  }

  return stored ?? [];
});

export const saveBookmarksToStorage = createAsyncThunk<void, Bookmark[]>('bookmarks/save', async (bookmarks) => {
  await chromeStorage.set(STORAGE_KEY, bookmarks);
});
