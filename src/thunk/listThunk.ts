import { createAsyncThunk } from '@reduxjs/toolkit';
import { ListItem } from '@/store/slice/listSlice';
import { chromeStorage } from '@/util/chromeStorage';

const STORAGE_KEY = 'list_items';

interface ListState {
  items: ListItem[];
  nextId: number;
}

export const loadListFromStorage = createAsyncThunk<ListState>('list/load', async () => {
  console.log('리스트 로드 시도');

  const stored = await chromeStorage.get<ListState>(STORAGE_KEY);

  console.log('저장된 데이터:', stored);

  if (stored === undefined || stored === null) {
    console.log('저장된 데이터 없음 - 기본값 설정');
    const defaultState: ListState = {
      items: [],
      nextId: 1,
    };
    await chromeStorage.set(STORAGE_KEY, defaultState);
    return defaultState;
  }

  console.log('저장된 리스트 반환:', stored);
  return stored;
});

export const saveListToStorage = createAsyncThunk<void, ListState>('list/save', async (listState) => {
  console.log('리스트 저장 시도:', listState);
  await chromeStorage.set(STORAGE_KEY, listState);
  console.log('리스트 저장 완료');
});
