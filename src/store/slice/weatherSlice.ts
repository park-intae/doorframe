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
        return JSON.parse(cached);
      }
    }
    // 1. 위치 가져오기
    const pos = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej),
    );
    const { latitude, longitude } = pos.coords;

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal 
      ? 'http://127.0.0.1:54321/functions/v1' 
      : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // 2. 서버 API 호출 (날씨 정보와 주소 정보를 함께 가져옴)
    const res = await fetch(`${baseUrl}/weather?lat=${latitude}&lon=${longitude}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
    });

    if (!res.ok) throw new Error('날씨 정보 가져오기 실패');

    const data = await res.json();

    // 3. 데이터 반환
    if (typeof window !== 'undefined') {
        localStorage.setItem('lastWeatherFetch', Date.now().toString());
        localStorage.setItem('cachedWeather', JSON.stringify(data));
    }
    return data;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '날씨 정보를 가져오는 중 오류가 발생했습니다.';
    console.error('날씨 데이터 페칭 오류:', err);
    return rejectWithValue(errorMessage);
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
