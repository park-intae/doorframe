import { vi, describe, it, expect, beforeEach } from 'vitest';
import reducer, { fetchWeather } from './weatherSlice';
import { configureStore } from '@reduxjs/toolkit';
import { mockGeolocation } from '@/test/mocks/weatherMock';

// Mocking
global.fetch = vi.fn();
(global.navigator as any).geolocation = mockGeolocation;

describe('weatherSlice thunk 철저한 검증', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('API 응답이 성공했을 때 날씨 정보를 업데이트해야 함', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        temperature: '20',
        weather: 'Clear',
        region: 'Seoul',
      }),
    });

    const store = configureStore({ reducer: { weather: reducer } });
    await store.dispatch(fetchWeather() as any);

    const state = store.getState().weather;
    expect(state.loading).toBe(false);
    expect(state.temperature).toBe('20');
    expect(state.weather).toBe('Clear');
    expect(state.region).toBe('Seoul');
  });

  it('API 응답이 실패했을 때 에러 상태를 반환해야 함', async () => {
    (global.fetch as any).mockResolvedValue({ ok: false });

    const store = configureStore({ reducer: { weather: reducer } });
    await store.dispatch(fetchWeather() as any);

    const state = store.getState().weather;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('날씨 정보 가져오기 실패');
  });

  it('위치 정보를 가져올 수 없을 때 에러를 처리해야 함', async () => {
    (global.navigator as any).geolocation.getCurrentPosition = vi.fn((_, reject) => 
        reject(new Error('위치 권한 거부'))
    );

    const store = configureStore({ reducer: { weather: reducer } });
    await store.dispatch(fetchWeather() as any);

    const state = store.getState().weather;
    expect(state.error).toBe('위치 권한 거부');
  });
});
