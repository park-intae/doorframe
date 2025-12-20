import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bookmark, BookmarkInput } from 'app/type/bookmark';

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

//불러오기
export const loadFromStorage = (): Bookmark[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultBookmarks;
  } catch (error) {
    console.error('불러오기 실패', error);
  }
  return defaultBookmarks;
};

//저장
const saveToStorage = (bookmarks: Bookmark[]) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('저장 실패:', error);
  }
};

const initialState: Bookmark[] = loadFromStorage();

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark(state, action: PayloadAction<BookmarkInput>) {
      const maxId = state.length > 0 ? Math.max(...state.map((b) => b.id)) : 0;

      const newBookmark: Bookmark = {
        ...action.payload,
        id: maxId + 1,
      };

      state.push(newBookmark);
      saveToStorage(state);
    },
    removeBookmark(state, action: PayloadAction<number>) {
      const idx = state.findIndex((bMark) => bMark.id === action.payload);
      if (idx !== -1) {
        state.splice(idx, 1);
        saveToStorage(state);
      }
    },
    setBookmarks(_, action: PayloadAction<Bookmark[]>) {
      saveToStorage(action.payload);
      return action.payload;
    },
    loadBookmarks() {
      const loaded = loadFromStorage();
      saveToStorage(loaded);
      return loaded;
    },
  },
});

export const { addBookmark, removeBookmark, setBookmarks, loadBookmarks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
