import { createAsyncThunk } from '@reduxjs/toolkit';
import { ListItem } from '@/store/slice/listSlice';
import { chromeStorage } from '@/util/chromeStorage';

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
  const key = getUserStorageKey(userId);
  const stored = await chromeStorage.get<ListState>(key);

  if (stored === undefined || stored === null) {
    // 로그인 사용자 키에 데이터가 없는 경우 기존 게스트 리스트가 있는지 확인하여 자동 마이그레이션
    if (userId) {
      const guestKey = getUserStorageKey(undefined);
      const guestStored = await chromeStorage.get<ListState>(guestKey);
      if (guestStored && guestStored.items && guestStored.items.length > 0) {
        await chromeStorage.set(key, guestStored);
        return guestStored;
      }
    }

    const defaultState: ListState = {
      items: [],
      nextId: 1,
    };
    await chromeStorage.set(key, defaultState);
    return defaultState;
  }

  return stored;
});
