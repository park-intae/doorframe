import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MediaState {
  isPlaying: boolean;
  playlist: string[];
  currentVideoId: string | null;
  volume: number;
}

const initialState: MediaState = {
  isPlaying: false,
  playlist: [],
  currentVideoId: null,
  volume: 100,
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setPlaylist: (state, action: PayloadAction<string[]>) => {
      state.playlist = action.payload;
    },
    setCurrentVideoId: (state, action: PayloadAction<string | null>) => {
      state.currentVideoId = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
  },
});

export const { setPlaying, setPlaylist, setCurrentVideoId, setVolume } = mediaSlice.actions;
export default mediaSlice.reducer;
