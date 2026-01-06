import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadBookmarksFromStorage } from '@/thunk/bookmarkThunk';
import { Bookmark, BookmarkInput } from '@/type/bookmark';

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
