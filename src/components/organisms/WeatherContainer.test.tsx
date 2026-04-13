import { describe, it, expect, vi, Mock } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WeatherContainer from './WeatherContainer';
import weatherReducer from '@/store/slice/weatherSlice';

// Mocking fetch and geolocation
global.fetch = vi.fn();

const mockGeolocation: Geolocation = {
    getCurrentPosition: vi.fn((success) => success({
        coords: { latitude: 37.5665, longitude: 126.9780, altitude: null, accuracy: 0, altitudeAccuracy: null, heading: null, speed: null }
    } as GeolocationPosition)),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true
});

describe('WeatherContainer Component', () => {
    it('날씨 정보를 받아오면 제대로 렌더링해야 함', async () => {
        (global.fetch as Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                temperature: '20',
                weather: '맑음',
                region: '서울특별시 중구 명동',
            }),
        });

        const store = configureStore({ reducer: { weather: weatherReducer } });
        
        const { findByText } = render(
            <Provider store={store}>
                <WeatherContainer />
            </Provider>
        );

        // 로딩이 끝나고 데이터가 렌더링될 때까지 대기
        const tempElement = await findByText('20');
        const weatherElement = await findByText('맑음');
        const regionElement = await findByText('명동');

        expect(tempElement).toBeDefined();
        expect(weatherElement).toBeDefined();
        expect(regionElement).toBeDefined();
    });
});
