import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WeatherView from './WeatherView';
import { describe, it, expect, vi } from 'vitest';
import { DailyForecast, WeatherHourly } from '@/type/weather';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from '@/store/slice/weatherSlice';

// Canvas / Chart mock
vi.mock('./WeatherChart', () => ({
  default: () => <div data-testid="mock-weather-chart">차트</div>,
}));

describe('WeatherView Component', () => {
  const createStore = () =>
    configureStore({
      reducer: { weather: weatherReducer },
    });

  const renderWithRedux = (ui: React.ReactElement) => {
    const store = createStore();
    return render(<Provider store={store}>{ui}</Provider>);
  };

  const mockForecast: DailyForecast[] = [
    { date: '2026-09-30', weatherStatus: '맑음', minTemp: '12', maxTemp: '24', precipitation: '10%' },
    { date: '2026-10-01', weatherStatus: '비', minTemp: '14', maxTemp: '20', precipitation: '80%' },
    { date: '2026-10-02', weatherStatus: '흐림', minTemp: '10', maxTemp: '18', precipitation: '0%' },
  ];

  const mockHourly: WeatherHourly[] = [
    { time: '12:00', temp: '22', weather: '맑음' },
    { time: '13:00', temp: '24', weather: '맑음' },
  ];

  it('로딩 중이고 기온이 없을 때 스켈레톤을 렌더링해야 함', () => {
    const { container } = renderWithRedux(
      <WeatherView
        temperature={null}
        weather=""
        region=""
        forecast={[]}
        hourly={[]}
        loading={true}
        error={null}
      />
    );
    expect(container.querySelector('.animate-pulse')).toBeDefined();
  });

  it('에러가 발생하고 기온이 없을 때 에러 메시지를 렌더링해야 함', () => {
    renderWithRedux(
      <WeatherView
        temperature={null}
        weather=""
        region=""
        forecast={[]}
        hourly={[]}
        loading={false}
        error="날씨 데이터를 불러올 수 없습니다."
      />
    );
    expect(screen.getByText('날씨 데이터를 불러올 수 없습니다.')).toBeDefined();
  });

  it('실황 날씨 데이터가 주어졌을 때 현재 기온, 날씨, 지역명을 렌더링해야 함', () => {
    renderWithRedux(
      <WeatherView
        temperature="23"
        weather="맑음"
        region="서울특별시 강남구 역삼동"
        forecast={mockForecast}
        hourly={mockHourly}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByText('23°')).toBeDefined();
    expect(screen.getByText('맑음')).toBeDefined();
    expect(screen.getByText('역삼동')).toBeDefined();
    expect(screen.getByTestId('mock-weather-chart')).toBeDefined();
    expect(screen.getByText('Data by KMA')).toBeDefined();
  });

  it('fallback 상태일 때 기본 위치 배지와 백업 소스 텍스트를 표시해야 함', () => {
    renderWithRedux(
      <WeatherView
        temperature="18"
        weather="구름많음"
        region="서울특별시"
        forecast={mockForecast}
        hourly={mockHourly}
        loading={false}
        error={null}
        isFallback={true}
        backupSource="Open-Meteo"
      />
    );

    expect(screen.getAllByText('기본 위치').length).toBeGreaterThan(0);
    expect(screen.getByText('현재 백업망 사용중 (Open-Meteo)')).toBeDefined();
  });

  it('인디케이터 버튼 클릭 시 실황(0)과 단기 예보(1) 페이지를 전환할 수 있어야 함', async () => {
    renderWithRedux(
      <WeatherView
        temperature="21"
        weather="맑음"
        region="서울"
        forecast={mockForecast}
        hourly={mockHourly}
        loading={false}
        error={null}
      />
    );

    // 단기 예보 버튼 클릭
    const forecastButton = screen.getByLabelText('단기 예보 보기');
    fireEvent.click(forecastButton);

    const titleEl = await screen.findByText('단기 예보 (3일간)');
    expect(titleEl).toBeDefined();
    expect(screen.getByText('오늘')).toBeDefined();
    expect(screen.getByText('내일')).toBeDefined();
    expect(screen.getByText('모레')).toBeDefined();
    expect(screen.getByText('24°')).toBeDefined();
    expect(screen.getByText('12°')).toBeDefined();

    // 실황 날씨 버튼 클릭하여 복귀
    const currentWeatherButton = screen.getByLabelText('실황 날씨 보기');
    fireEvent.click(currentWeatherButton);

    const tempEl = await screen.findByText('21°');
    expect(tempEl).toBeDefined();
  });

  it('카드 클릭 시 페이지가 토글되어야 함', async () => {
    const { container } = renderWithRedux(
      <WeatherView
        temperature="21"
        weather="맑음"
        region="서울"
        forecast={mockForecast}
        hourly={mockHourly}
        loading={false}
        error={null}
      />
    );

    const card = container.querySelector('#weather-container')!;
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText('단기 예보 (3일간)')).toBeDefined();
    });

    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText('21°')).toBeDefined();
    });
  });

  it('마우스 휠 이벤트로 페이지가 전환되어야 함', async () => {
    const { container } = renderWithRedux(
      <WeatherView
        temperature="21"
        weather="맑음"
        region="서울"
        forecast={mockForecast}
        hourly={mockHourly}
        loading={false}
        error={null}
      />
    );

    const card = container.querySelector('#weather-container')!;

    // 아래로 휠(deltaY > 15) -> 페이지 1로 전환
    fireEvent.wheel(card, { deltaY: 25 });
    await waitFor(() => {
      expect(screen.getByText('단기 예보 (3일간)')).toBeDefined();
    });
  });

  it('예보 아이템 마우스 오버 시 툴팁이 동작해야 함', async () => {
    const { container } = renderWithRedux(
      <WeatherView
        temperature="21"
        weather="맑음"
        region="서울"
        forecast={mockForecast}
        hourly={mockHourly}
        loading={false}
        error={null}
      />
    );

    // 예보 페이지로 이동
    fireEvent.click(screen.getByLabelText('단기 예보 보기'));

    // 최고 기온에 호버
    const maxTempEl = await screen.findByText('24°');
    fireEvent.mouseEnter(maxTempEl);
    expect(await screen.findByText('최고 기온')).toBeDefined();

    fireEvent.mouseLeave(maxTempEl);

    // 최저 기온에 호버
    const minTempEl = await screen.findByText('12°');
    fireEvent.mouseEnter(minTempEl);
    expect(await screen.findByText('최저 기온')).toBeDefined();

    // 마우스 이동 시 좌표 계산
    const card = container.querySelector('#weather-container')!;
    fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
    fireEvent.mouseLeave(card);
  });

  it('hourly 데이터가 비어있을 때 차트 부분 스켈레톤을 렌더링해야 함', () => {
    const { container } = renderWithRedux(
      <WeatherView
        temperature="20"
        weather="맑음"
        region="서울"
        forecast={[]}
        hourly={[]}
        loading={false}
        error={null}
      />
    );

    expect(container.querySelector('.animate-pulse')).toBeDefined();
  });
});
