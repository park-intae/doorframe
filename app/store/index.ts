import { configureStore } from '@reduxjs/toolkit';
import todayReducer from './todaySlice';

export const store = configureStore({
  reducer: {
    today: todayReducer,
    // 다른 slice들도 여기에 추가
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
