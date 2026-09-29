import { describe, it, expect, beforeEach, vi } from 'vitest';
import weatherReducer, {
  restoreCachedWeather,
  getValidCachedWeather,
  fetchWeather,
  fetchCurrentWeather,
  fetchWeatherForecast,
} from './weatherSlice';
import { WeatherResponse, WeatherCurrentResponse, WeatherForecastResponse } from '@/type/weather';
import { configureStore } from '@reduxjs/toolkit';

describe('weatherSlice reducer and thunks', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const initialState = {
    temperature: null,
    weather: '',
    region: '',
    forecast: [],
    hourly: [],
    loading: false,
    currentLoading: false,
    forecastLoading: false,
    error: null,
    isFallback: false,
    backupSource: null,
  };

  const mockWeatherData: WeatherResponse = {
    current: {
      temperature: '22',
      weather: '맑음',
      region: '서울특별시 강남구',
    },
    forecast: [
      { date: '20260426', minTemp: '15', maxTemp: '25', weatherStatus: '맑음', precipitation: '0%' },
      { date: '20260427', minTemp: '16', maxTemp: '26', weatherStatus: '흐림', precipitation: '20%' },
      { date: '20260428', minTemp: '14', maxTemp: '24', weatherStatus: '비', precipitation: '60%' },
    ],
    hourly: [
      { time: '14:00', temp: '22', weather: '맑음' },
      { time: '15:00', temp: '23', weather: '맑음' },
    ],
  };

  it('초기 상태를 올바르게 반환해야 한다', () => {
    expect(weatherReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('fetchWeather.pending 시 loading 상태가 true여야 한다', () => {
    const action = { type: 'weather/fetchWeather/pending' };
    const state = weatherReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.currentLoading).toBe(true);
    expect(state.forecastLoading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('fetchWeather.fulfilled 시 날씨 데이터가 상태에 올바르게 매핑되어야 한다', () => {
    const action = { 
      type: 'weather/fetchWeather/fulfilled', 
      payload: mockWeatherData 
    };
    const state = weatherReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.temperature).toBe('22');
    expect(state.weather).toBe('맑음');
    expect(state.region).toBe('서울특별시 강남구');
    expect(state.forecast).toHaveLength(3);
    expect(state.forecast[1].weatherStatus).toBe('흐림');
    expect(state.hourly).toHaveLength(2);
    expect(state.hourly[0].temp).toBe('22');
  });

  it('fetchCurrentWeather.fulfilled 시 초단기 실황 데이터가 즉시 반영되고 loading이 해제되어야 한다', () => {
    const mockCurrent: WeatherCurrentResponse = {
      current: {
        temperature: '24',
        weather: '구름많음',
        region: '서울특별시 송파구',
      },
      isFallback: false,
      backupSource: null,
    };

    const action = {
      type: 'weather/fetchCurrentWeather/fulfilled',
      payload: mockCurrent,
    };
    const pendingState = { ...initialState, loading: true, currentLoading: true };
    const state = weatherReducer(pendingState, action);

    expect(state.currentLoading).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.temperature).toBe('24');
    expect(state.weather).toBe('구름많음');
    expect(state.region).toBe('서울특별시 송파구');
  });

  it('fetchWeatherForecast.fulfilled 시 3일 예보 및 시간별 데이터가 정상 반영되어야 한다', () => {
    const mockForecast: WeatherForecastResponse = {
      forecast: mockWeatherData.forecast,
      hourly: mockWeatherData.hourly,
      isFallback: false,
      backupSource: null,
    };

    const action = {
      type: 'weather/fetchWeatherForecast/fulfilled',
      payload: mockForecast,
    };
    const pendingState = { ...initialState, forecastLoading: true };
    const state = weatherReducer(pendingState, action);

    expect(state.forecastLoading).toBe(false);
    expect(state.forecast).toHaveLength(3);
    expect(state.hourly).toHaveLength(2);
  });

  it('fetchCurrentWeather.rejected 및 fetchWeatherForecast.rejected 처리 검증', () => {
    const action1 = {
      type: 'weather/fetchCurrentWeather/rejected',
      payload: '실황 에러',
    };
    const state1 = weatherReducer(initialState, action1);
    expect(state1.currentLoading).toBe(false);
    expect(state1.error).toBe('실황 에러');

    const action2 = {
      type: 'weather/fetchWeatherForecast/rejected',
    };
    const state2 = weatherReducer(initialState, action2);
    expect(state2.forecastLoading).toBe(false);
  });

  it('restoreCachedWeather 리듀서 실행 시 캐시 데이터가 즉각 복원되어야 한다', () => {
    const state = weatherReducer(initialState, restoreCachedWeather(mockWeatherData));
    expect(state.temperature).toBe('22');
    expect(state.weather).toBe('맑음');
    expect(state.loading).toBe(false);
  });

  it('fetchWeather.rejected 시 에러 메시지가 상태에 저장되어야 한다', () => {
    const action = { 
      type: 'weather/fetchWeather/rejected', 
      payload: '날씨 정보 가져오기 실패' 
    };
    const state = weatherReducer(initialState, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe('날씨 정보 가져오기 실패');
  });

  it('30분 이내의 유효 캐시는 getValidCachedWeather가 정상 복원해야 한다', () => {
    localStorage.setItem('lastWeatherFetch', (Date.now() - 15 * 60 * 1000).toString()); // 15분 전 (SWR 구간)
    localStorage.setItem('cachedWeather', JSON.stringify(mockWeatherData));

    const cached = getValidCachedWeather();
    expect(cached).not.toBeNull();
    expect(cached?.current.temperature).toBe('22');
  });

  it('30분이 초과된 캐시는 프라이버시 보호를 위해 자동 영구 삭제되어야 한다', () => {
    localStorage.setItem('lastWeatherFetch', (Date.now() - 35 * 60 * 1000).toString()); // 35분 전 (만료 구간)
    localStorage.setItem('cachedWeather', JSON.stringify(mockWeatherData));

    const cached = getValidCachedWeather();
    expect(cached).toBeNull();
    expect(localStorage.getItem('cachedWeather')).toBeNull();
    expect(localStorage.getItem('lastWeatherFetch')).toBeNull();
  });

  it('fetchWeather Thunk: 10분 이내의 신선한 캐시가 있으면 네트워크 요청 없이 즉시 반환해야 함', async () => {
    localStorage.setItem('lastWeatherFetch', (Date.now() - 5 * 60 * 1000).toString()); // 5분 전
    localStorage.setItem('cachedWeather', JSON.stringify(mockWeatherData));

    const store = configureStore({
      reducer: { weather: weatherReducer },
    });

    const result = await store.dispatch(fetchWeather());
    expect(result.payload).toEqual(mockWeatherData);
  });

  it('fetchCurrentWeather thunk: API 호출 성공 시 실황 데이터 반환', async () => {
    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature: '25', weather: '맑음', region: '서울' },
        isFallback: false,
      }),
    });

    const store = configureStore({ reducer: { weather: weatherReducer } });
    const result = await store.dispatch(fetchCurrentWeather({ latitude: 37.5, longitude: 127.0 }));
    expect((result.payload as any).current.temperature).toBe('25');
    expect(store.getState().weather.temperature).toBe('25');
  });

  it('fetchWeatherForecast thunk: API 호출 성공 시 예보 데이터 반환', async () => {
    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        forecast: [{ date: '20261001', weatherStatus: '맑음', minTemp: '15', maxTemp: '25', precipitation: '0%' }],
        hourly: [{ time: '12:00', temp: '25', weather: '맑음' }],
        isFallback: false,
      }),
    });

    const store = configureStore({ reducer: { weather: weatherReducer } });
    const result = await store.dispatch(fetchWeatherForecast({ latitude: 37.5, longitude: 127.0 }));
    expect((result.payload as any).forecast).toHaveLength(1);
    expect(store.getState().weather.forecast).toHaveLength(1);
  });

  it('fetchCurrentWeather thunk: API 오류 시 Open-Meteo 백업망으로 자동 전환', async () => {
    (global as any).fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('functions/v1/weather')) {
        return { ok: false, status: 500 };
      }
      if (url.includes('reverse-geocode-client')) {
        return {
          ok: true,
          json: async () => ({ principalSubdivision: '서울특별시', locality: '강남구' }),
        };
      }
      if (url.includes('api.open-meteo.com')) {
        return {
          ok: true,
          json: async () => ({
            current: { temperature_2m: 23.4, weather_code: 0 },
            hourly: { time: ['2026-09-30T12:00'], temperature_2m: [23.4], weather_code: [0] },
            daily: { time: ['2026-09-30'], temperature_2m_max: [25.0], temperature_2m_min: [15.0], weather_code: [0], precipitation_probability_max: [10] },
          }),
        };
      }
      return { ok: false };
    });

    const store = configureStore({ reducer: { weather: weatherReducer } });
    const result = await store.dispatch(fetchCurrentWeather({ latitude: 37.5, longitude: 127.0 }));
    expect((result.payload as any).backupSource).toBe('Open-Meteo');
    expect(store.getState().weather.temperature).toBe('23');
  });
});
