import { createAsyncThunk } from '@reduxjs/toolkit';
import { ListItem } from '@/store/slice/listSlice';
import { chromeStorage } from '@/util/chromeStorage';
import { supabase } from '@/config/supabase';

const BASE_STORAGE_KEY = 'list_items';
const getUserStorageKey = (userId?: string) => userId ? `${userId}_${BASE_STORAGE_KEY}` : `guest_${BASE_STORAGE_KEY}`;

interface ListState {
  items: ListItem[];
  nextId: number;
}

export const saveListToStorage = createAsyncThunk<void, { listState: ListState; userId?: string }>('list/save', async ({ listState, userId }) => {
  const key = getUserStorageKey(userId)
  await chromeStorage.set(key, listState);
});

export const loadListFromStorage = createAsyncThunk<ListState, string | undefined>('list/load', async (userId) => {
  const key = getUserStorageKey(userId)
  const stored = await chromeStorage.get<ListState>(key);

  if (stored === undefined || stored === null) {
    const defaultState: ListState = {
      items: [],
      nextId: 1,
    };
    await chromeStorage.set(key, defaultState);
    return defaultState;
  }

  return stored;
});
