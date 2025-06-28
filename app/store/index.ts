import { configureStore } from '@reduxjs/toolkit';
import todayReducer from './todaySlice';
import modalReducer from './modalSlice';

export const store = configureStore({
  reducer: {
    today: todayReducer,
    modal: modalReducer,
    // 다른 slice들도 여기에 추가
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
