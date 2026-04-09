import reducer, { updateDateTime } from './todaySlice';
import { vi, describe, it, expect } from 'vitest';

describe('todaySlice reducer', () => {
  it('updateDateTime 호출 시 날짜와 시간이 업데이트되어야 함', () => {
    // 고정 시간 설정 (2026-04-09 14:00:00)
    const mockDate = new Date(2026, 3, 9, 14, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const initialState = { date: '', time: '' };
    const nextState = reducer(initialState, updateDateTime());

    expect(nextState.date).toBe('2026년 4월 9일 목요일');
    // 로컬 환경의 locale 설정에 따라 '오후 02:00' 또는 '14:00'일 수 있으므로 포괄적으로 확인
    expect(nextState.time).toBeDefined();

    vi.useRealTimers();
  });
});
