import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TodayTimeState {
  date: string;
  time: string;
}

const getCurrentDate = (): string =>
  new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

const getCurrentTime = (): string =>
  new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const initialState: TodayTimeState = {
  date: '',
  time: '',
};

const todaySlice = createSlice({
  name: 'today',
  initialState,
  reducers: {
    updateDateTime: (state) => {
      state.date = getCurrentDate();
      state.time = getCurrentTime();
    },
    // 필요하면 수동 설정도 가능하게:
    setDateTime: (state, action: PayloadAction<TodayTimeState>) => {
      state.date = action.payload.date;
      state.time = action.payload.time;
    },
  },
});

export const { updateDateTime, setDateTime } = todaySlice.actions;
export default todaySlice.reducer;
