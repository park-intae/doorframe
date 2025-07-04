import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bookmark } from 'app/type/bookmark';

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

const loadInitialBookmarks = (): Bookmark[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultBookmarks;
};

const initialState: Bookmark[] = loadInitialBookmarks();

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark(state, action: PayloadAction<Bookmark>) {
      state.push(action.payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    removeBookmark(state, action: PayloadAction<number>) {
      const idx = state.findIndex((bMark) => bMark.id === action.payload);
      if (idx !== -1) state.splice(idx, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    setBookmarks(state, action: PayloadAction<Bookmark[]>) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      return action.payload;
    },
  },
});

export const { addBookmark, removeBookmark, setBookmarks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
