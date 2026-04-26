import { describe, it, expect } from 'vitest';
import weatherReducer from './weatherSlice';
import { WeatherResponse } from '@/type/weather';

describe('weatherSlice reducer', () => {
  const initialState = {
    temperature: null,
    weather: '',
    region: '',
    forecast: [],
    hourly: [],
    loading: false,
    error: null,
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
