import { render } from '@testing-library/react';
import WeatherChart from './WeatherChart';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Chart } from 'chart.js';

// Chart.js 모킹 (Function constructor 사용)
vi.mock('chart.js', () => {
  const MockChart = vi.fn(function (this: any) {
    this.destroy = vi.fn();
    return this;
  });
  (MockChart as any).register = vi.fn();

  return {
    Chart: MockChart,
    LineController: vi.fn(),
    LineElement: vi.fn(),
    PointElement: vi.fn(),
    LinearScale: vi.fn(),
    Title: vi.fn(),
    CategoryScale: vi.fn(),
    Tooltip: vi.fn(),
    Filler: vi.fn(),
  };
});

describe('WeatherChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // HTMLCanvasElement getContext 모킹
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({} as any);
  });

  const mockData = [
    { time: '09:00', temp: '18', weather: '맑음' },
    { time: '12:00', temp: '22', weather: '맑음' },
    { time: '15:00', temp: '24', weather: '맑음' },
  ];

  it('데이터가 주어졌을 때 Canvas와 Chart 인스턴스를 정상 생성해야 함', () => {
    const { container, unmount } = render(<WeatherChart data={mockData} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeDefined();
    expect(Chart).toHaveBeenCalledTimes(1);

    // 언마운트 시 destroy 호출 검증
    unmount();
    const chartInstance = vi.mocked(Chart).mock.results[0]?.value;
    expect(chartInstance.destroy).toHaveBeenCalled();
  });

  it('데이터가 비어있을 때 차트를 생성하지 않아야 함', () => {
    render(<WeatherChart data={[]} />);
    expect(Chart).not.toHaveBeenCalled();
  });

  it('getContext가 null을 반환할 때 안전하게 종료되어야 함', () => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
    render(<WeatherChart data={mockData} />);
    expect(Chart).not.toHaveBeenCalled();
  });
});
