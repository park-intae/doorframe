import { describe, it, expect } from 'vitest';
import weatherReducer, { restoreCachedWeather } from './weatherSlice';
import { WeatherResponse, WeatherCurrentResponse, WeatherForecastResponse } from '@/type/weather';

describe('weatherSlice reducer', () => {
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
});
