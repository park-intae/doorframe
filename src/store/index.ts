import { configureStore } from '@reduxjs/toolkit';
import todayReducer from './slice/todaySlice';
import inputReducer from './slice/inputSlice';
import listReducer from './slice/listSlice';
import bookmarkReducer from './slice/bookmarkSlice';
import weatherReducer from './slice/weatherSlice';
import authReducer from './slice/authSlice';
import mediaReducer from './slice/mediaSlice';
import themeReducer from './slice/themeSlice';

export const store = configureStore({
  reducer: {
    today: todayReducer,
    input: inputReducer,
    list: listReducer,
    bookmarks: bookmarkReducer,
    weather: weatherReducer,
    auth: authReducer,
    media: mediaReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
