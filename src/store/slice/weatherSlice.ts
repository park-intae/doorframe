import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { DailyForecast, WeatherHourly, WeatherResponse } from '@/type/weather';

interface WeatherState {
  temperature: string | null;
  weather: string;
  region: string;
  forecast: DailyForecast[];
  hourly: WeatherHourly[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
}

const initialState: WeatherState = {
  temperature: null,
  weather: '',
  region: '',
  forecast: [],
  hourly: [],
  loading: false,
  error: null,
  isFallback: false,
};

const CACHE_DURATION = 10 * 60 * 1000;

export const fetchWeather = createAsyncThunk('weather/fetchWeather', async (_, { rejectWithValue }) => {
  try {
    // 클라이언트 사이드 캐싱 확인
    if (typeof window !== 'undefined') {
      const lastFetch = localStorage.getItem('lastWeatherFetch');
      const cached = localStorage.getItem('cachedWeather');
      const now = Date.now();

      if (lastFetch && cached && now - parseInt(lastFetch) < CACHE_DURATION) {
        return JSON.parse(cached) as WeatherResponse;
      }
    }

    // 1. 사용자 위치 정보 획득 (실패 시 서울 기본 좌표로 폴백)
    let latitude = 37.5665;
    let longitude = 126.9780;
    let isLocationFallback = false;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: false, timeout: 3000 }),
      );
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    } catch (geoErr) {
      isLocationFallback = true;
      console.warn('위치 권한을 얻지 못해 기본 좌표(서울)를 사용합니다.', geoErr);
    }

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal 
      ? 'http://127.0.0.1:54321/functions/v1' 
      : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // 2. 고도화된 날씨 API(Edge Function) 호출
    const res = await fetch(`${baseUrl}/weather?lat=${latitude}&lon=${longitude}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
    });

    if (!res.ok) throw new Error('날씨 서버 응답 실패');

    const rawData = await res.json();
    console.log('[Weather Redux Debug] Raw Data from Server:', rawData);

    // 하위 호환성: 신규 스키마(current)와 구버전 플랫 스키마 모두 지원
    const data: WeatherResponse = {
      current: rawData.current || {
        temperature: rawData.temperature && rawData.temperature !== 'N/A' ? rawData.temperature : '0',
        weather: rawData.weather || '맑음',
        region: rawData.region || '서울특별시',
      },
      forecast: Array.isArray(rawData.forecast) ? rawData.forecast : [],
      hourly: Array.isArray(rawData.hourly) ? rawData.hourly : [],
      isFallback: isLocationFallback || !rawData.current || rawData.temperature === 'N/A',
    };

    // 3. 캐싱 및 데이터 반환
    if (typeof window !== 'undefined') {
        localStorage.setItem('lastWeatherFetch', Date.now().toString());
        localStorage.setItem('cachedWeather', JSON.stringify(data));
    }
    return data;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string')
          ? (err as any).message
          : '날씨 정보를 가져오는 중 오류가 발생했습니다.';
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
        console.log('[Weather Redux Debug] Fulfilling with payload:', action.payload);
        state.loading = false;
        state.temperature = action.payload.current.temperature;
        state.weather = action.payload.current.weather;
        state.region = action.payload.current.region;
        state.forecast = action.payload.forecast;
        state.hourly = action.payload.hourly;
        state.isFallback = action.payload.isFallback ?? false;
        console.log('[Weather Redux Debug] Updated State Temperature:', state.temperature);
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default weatherSlice.reducer;
