import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useCalendar } from './useCalendar';
import listReducer, { ListItem } from '@/store/slice/listSlice';

const createWrapper = (items: ListItem[] = []) => {
    const store = configureStore({
        reducer: {
            list: listReducer,
        },
        preloadedState: {
            list: {
                items,
                nextId: 100,
            },
        },
    });

    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(Provider, { store }, children);
};

describe('useCalendar 훅 및 기간 필터링 검증', () => {
    it('마감일이 있는 할 일은 등록일부터 마감일까지 전 기간(중간 기간 포함) 동안 조회된다', () => {
        const testTodo: ListItem = {
            id: 1,
            kind: 'todo',
            text: '장기 프로젝트',
            completed: false,
            date: '2026-09-01',
            deadline: '2026-09-10',
        };

        const wrapper = createWrapper([testTodo]);
        const { result } = renderHook(() => useCalendar(), { wrapper });

        // kind를 'todo'로 전환
        act(() => {
            result.current.setKind('todo');
        });

        // 2026-09-01 (등록일) -> 포함
        // viewDate를 2026-09-05(중간 날짜)로 시뮬레이션
        // useCalendar 내부 viewDate는 today이므로, prevDay / nextDay 등을 사용하거나 날짜 넘기기 테스트
    });

    it('마감일이 없는 할 일은 등록 당일에만 노출된다', () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const testTodo: ListItem = {
            id: 1,
            kind: 'todo',
            text: '오늘만 하는 할 일',
            completed: false,
            date: todayStr,
        };

        const wrapper = createWrapper([testTodo]);
        const { result } = renderHook(() => useCalendar(), { wrapper });

        act(() => {
            result.current.setKind('todo');
        });

        expect(result.current.filteredItems).toHaveLength(1);
        expect(result.current.filteredItems[0].text).toBe('오늘만 하는 할 일');

        // 내일로 넘기면 노출되지 않아야 함
        act(() => {
            result.current.handleNextDay();
        });
        expect(result.current.filteredItems).toHaveLength(0);
    });

    it('등록일 ~ 마감일 사이의 중간 날짜로 이동해도 할 일이 계속 유지된다', () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // 3일 후 마감
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);
        const deadlineStr = threeDaysLater.toISOString().split('T')[0];

        const testTodo: ListItem = {
            id: 2,
            kind: 'todo',
            text: '중간 기간 유지 할 일',
            completed: false,
            date: todayStr,
            deadline: deadlineStr,
        };

        const wrapper = createWrapper([testTodo]);
        const { result } = renderHook(() => useCalendar(), { wrapper });

        act(() => {
            result.current.setKind('todo');
        });

        // 1. 등록 당일(오늘) 노출 확인
        expect(result.current.filteredItems).toHaveLength(1);

        // 2. 내일(중간 날짜 1일차) 이동 시에도 노출 유지
        act(() => {
            result.current.handleNextDay();
        });
        expect(result.current.filteredItems).toHaveLength(1);

        // 3. 모레(중간 날짜 2일차) 이동 시에도 노출 유지
        act(() => {
            result.current.handleNextDay();
        });
        expect(result.current.filteredItems).toHaveLength(1);

        // 4. 마감 당일(3일차) 이동 시에도 노출 유지
        act(() => {
            result.current.handleNextDay();
        });
        expect(result.current.filteredItems).toHaveLength(1);

        // 5. 마감일 이후(4일차) 이동 시 노출 종료
        act(() => {
            result.current.handleNextDay();
        });
        expect(result.current.filteredItems).toHaveLength(0);
    });
});
