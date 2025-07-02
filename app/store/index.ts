import { configureStore } from '@reduxjs/toolkit';
import todayReducer from './slice/todaySlice';
import modalReducer from './slice/modalSlice';
import inputReducer from './slice/inputSlice';
import listReducer from './slice/listSlice';

export const store = configureStore({
  reducer: {
    Today: todayReducer,
    modal: modalReducer,
    input: inputReducer,
    list: listReducer,
    // 다른 slice들도 여기에 추가
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
