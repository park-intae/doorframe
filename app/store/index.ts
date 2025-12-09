import { configureStore } from '@reduxjs/toolkit';
import todayReducer from './slice/todaySlice';
import modalReducer from './slice/modalSlice';
import inputReducer from './slice/inputSlice';
import listReducer from './slice/listSlice';
import bookmarkReducer from './slice/bookmarkSlice';
import weatherReducer from './slice/weatherSlice';
import popoverReducer from './slice/popoverSlice';

export const store = configureStore({
  reducer: {
    today: todayReducer,
    modal: modalReducer,
    input: inputReducer,
    list: listReducer,
    bookmarks: bookmarkReducer,
    weather: weatherReducer,
    popover: popoverReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['popover/openPopover'],
        ignoredActionPaths: ['payload.anchor'],
        ignoredPaths: ['popover.anchorRect'],
      },
    }),
});

store.subscribe(() => {
  const state = store.getState();

  localStorage.setItem('input', JSON.stringify(state.input));
  localStorage.setItem('list', JSON.stringify(state.list));
  localStorage.setItem('fav_items', JSON.stringify(state.bookmarks));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
