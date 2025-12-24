import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadBookmarksFromStorage } from 'app/thunk/bookmarkThunk';
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

const initialState: Bookmark[] = [];

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
    },
    removeBookmark(state, action: PayloadAction<number>) {
      return state.filter((b) => b.id !== action.payload);
    },
    setBookmarks(_, action: PayloadAction<Bookmark[]>) {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadBookmarksFromStorage.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export const { addBookmark, removeBookmark, setBookmarks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
