import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Filler,
} from 'chart.js';
import { WeatherHourly } from '@/type/weather';

// Chart.js 모듈 등록 (Tree Shaking 최적화)
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Filler
);

interface WeatherChartProps {
  data: WeatherHourly[];
}

/**
 * Chart.js를 직접 사용하여 기온 추이를 그리는 컴포넌트
 * @param data 24시간 시간별 기온 데이터
 */
export default function WeatherChart({ data }: WeatherChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    // 기존 차트 인스턴스 파괴 (메모리 누수 방지)
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // 기온 변화 시각화를 위한 선 그래프 생성
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((item) => item.time),
        datasets: [
          {
            label: '기온 (°C)',
            data: data.map((item) => Number(item.temp)),
            borderColor: '#3b82f6', // blue-500
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4, // 곡선 부드럽게
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 12, // 상단 최고 기온 곡선 잘림 방지 여백 확보
            bottom: 10, // 하단 라벨 여백 확보
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            titleColor: '#1e293b',
            bodyColor: '#1e293b',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.parsed.y}°C`,
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 5, // 글자가 커졌으므로 표시 개수 소폭 제한
              color: '#64748b',
              padding: 4,
              font: { 
                size: 11, // 가시성 개선을 위해 폰트 크기 확대
                weight: 'bold'
              },
            },
          },
          y: {
            display: false,
            beginAtZero: false,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="w-full h-28">
      <canvas ref={canvasRef} />
    </div>
  );
}
