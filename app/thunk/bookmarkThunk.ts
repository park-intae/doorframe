import { createAsyncThunk } from '@reduxjs/toolkit';
import { Bookmark } from 'app/type/bookmark';
import { chromeStorage } from 'app/util/chromeStorage';

const STORAGE_KEY = 'fav_items';

export const loadBookmarksFromStorage = createAsyncThunk<Bookmark[]>('bookmarks/load', async () => {
  const stored = await chromeStorage.get<Bookmark[]>(STORAGE_KEY);
  return stored ?? [];
});

export const saveBookmarksToStorage = createAsyncThunk<void, Bookmark[]>('bookmarks/save', async (bookmarks) => {
  await chromeStorage.set(STORAGE_KEY, bookmarks);
});
