import { describe, it, expect } from 'vitest';
import { getWeatherIconClass, isNightTime } from './WeatherIconMapper';

describe('WeatherIconMapper', () => {
  it('올바른 날씨 클래스를 반환해야 함', () => {
    expect(getWeatherIconClass('맑음')).toContain('wu-clear');
    expect(getWeatherIconClass('비')).toContain('wu-rain');
  });

  it('밤 시간일 때 wu-night 클래스를 포함해야 함', () => {
    expect(getWeatherIconClass('맑음', true)).toContain('wu-night');
    expect(getWeatherIconClass('맑음', true)).toContain('wu-clear');
  });

  it('isNightTime이 올바른 밤 시간을 판단해야 함', () => {
    // 0시 = 밤
    expect(isNightTime(0)).toBe(true);
    // 12시 = 낮
    expect(isNightTime(12)).toBe(false);
    // 20시 = 밤
    expect(isNightTime(20)).toBe(true);
  });
});
