import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MediaState {
  isPlaying: boolean;
}

const initialState: MediaState = {
  isPlaying: false,
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
  },
});

export const { setPlaying } = mediaSlice.actions;
export default mediaSlice.reducer;
