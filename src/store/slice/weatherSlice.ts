import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface WeatherState {
  temperature: string | null;
  weather: string;
  region: string;
  loading: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  temperature: null,
  weather: '',
  region: '',
  loading: false,
  error: null,
};

const CACHE_DURATION = 10 * 60 * 1000;

export const fetchWeather = createAsyncThunk('weather/fetchWeather', async (_, { rejectWithValue }) => {
  try {
    // CSC 확인
    if (typeof window !== 'undefined') {
      const lastFetch = localStorage.getItem('lastWeatherFetch');
      const cached = localStorage.getItem('cachedWeather');
      const now = Date.now();

      if (lastFetch && cached && now - parseInt(lastFetch) < CACHE_DURATION) {
        const remainingTime = Math.floor((CACHE_DURATION - (now - parseInt(lastFetch))) / 1000);
        console.log(`✅ 클라이언트 캐시 사용 (${remainingTime}초 남음)`);
        return JSON.parse(cached);
      }
    }
    // 1. 위치 가져오기
    const pos = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej)
    );
    const { latitude, longitude } = pos.coords;

    // 2. 서버 API 호출
    const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
    if (!res.ok) throw new Error('날씨 정보 가져오기 실패');

    const data = await res.json();
    console.log(data);

    return data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.temperature = action.payload.temperature;
        state.weather = action.payload.weather;
        state.region = action.payload.region;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default weatherSlice.reducer;
