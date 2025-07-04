import { configureStore } from '@reduxjs/toolkit';
import todayReducer from './slice/todaySlice';
import modalReducer from './slice/modalSlice';
import inputReducer from './slice/inputSlice';
import listReducer from './slice/listSlice';
import bookmarkReducer from './slice/bookmarkSlice';

export const store = configureStore({
  reducer: {
    today: todayReducer,
    modal: modalReducer,
    input: inputReducer,
    list: listReducer,
    bookmarks: bookmarkReducer,
    // 다른 slice들도 여기에 추가
  },
});

store.subscribe(() => {
  const state = store.getState();

  localStorage.setItem('input', JSON.stringify(state.input));
  localStorage.setItem('list', JSON.stringify(state.list));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
