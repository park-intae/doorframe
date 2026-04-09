import reducer, { updateDateTime } from './todaySlice';
import { vi, describe, it, expect } from 'vitest';

describe('todaySlice reducer', () => {
  it('시스템 시간을 기반으로 날짜와 시간이 정확히 업데이트되어야 함', () => {
    // 1. 고정 시간 설정
    const now = new Date(2026, 3, 9, 14, 0, 0); // 2026-04-09 14:00:00
    vi.useFakeTimers();
    vi.setSystemTime(now);

    // 2. 테스트 실행: 내부 함수가 실행됨
    const initialState = { date: '', time: '' };
    const nextState = reducer(initialState, updateDateTime());

    // 3. 실행 결과와 기대값(직접 호출한 결과) 일치 여부 확인
    const expectedDate = now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    const expectedTime = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    expect(nextState.date).toBe(expectedDate);
    expect(nextState.time).toBe(expectedTime);

    vi.useRealTimers();
  });
});
