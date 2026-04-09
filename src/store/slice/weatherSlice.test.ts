import { vi, describe, it, expect, beforeEach } from 'vitest';
import reducer, { fetchWeather } from './weatherSlice';
import { configureStore } from '@reduxjs/toolkit';

// Mocking
global.fetch = vi.fn();

describe('weatherSlice thunk 검증', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('현재 위치 좌표를 전달하여 API 호출에 성공해야 함', async () => {
    const coords = { latitude: 37.5, longitude: 127.0 };
    (global.navigator as any).geolocation = {
      getCurrentPosition: vi.fn((success) => success({ coords }))
    };

    // API 호출 성공 여부만 확인
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const store = configureStore({ reducer: { weather: reducer } });
    await store.dispatch(fetchWeather() as any);

    // 좌표값 정밀 검증
    expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`lat=${coords.latitude}&lon=${coords.longitude}`),
        expect.anything()
    );
  });
});
