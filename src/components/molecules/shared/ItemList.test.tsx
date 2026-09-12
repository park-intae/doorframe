import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ItemList from './ItemList';
import listReducer from '@/store/slice/listSlice';

const renderWithRedux = (ui: React.ReactElement, initialItems = []) => {
    const store = configureStore({
        reducer: {
            list: listReducer,
        },
        preloadedState: {
            list: {
                items: initialItems,
                nextId: 10,
            },
        },
    });
    return { ...render(<Provider store={store}>{ui}</Provider>), store };
};

describe('ItemList 마감일 표시 및 UI 테스트', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 7);
    const farFutureStr = farFuture.toISOString().split('T')[0];

    it('메모(memo) 항목은 마감일 뱃지가 표시되지 않는다', () => {
        const items = [
            { id: 1, kind: 'memo' as const, text: '테스트 메모', date: todayStr },
        ];
        renderWithRedux(<ItemList kind="memo" />, items);
        expect(screen.getByText('테스트 메모')).toBeDefined();
        expect(screen.queryByTitle(/마감일:/)).toBeNull();
    });

    it('마감일이 설정된 할 일(todo)은 마감일 뱃지와 D-Day 정보가 렌더링된다', () => {
        const items = [
            {
                id: 1,
                kind: 'todo' as const,
                text: '오늘 마감 할 일',
                completed: false,
                date: todayStr,
                deadline: todayStr,
            },
        ];
        renderWithRedux(<ItemList kind="todo" />, items);
        expect(screen.getByText('오늘 마감 할 일')).toBeDefined();
        expect(screen.getByText('D-Day')).toBeDefined();
    });

    it('마감 임박(D-Day, D-1) 또는 지난 항목은 붉은색 배경 클래스(bg-rose-500)가 적용된다', () => {
        const items = [
            {
                id: 1,
                kind: 'todo' as const,
                text: '긴급 마감 항목',
                completed: false,
                date: todayStr,
                deadline: tomorrowStr,
            },
        ];
        const { container } = renderWithRedux(<ItemList kind="todo" />, items);
        const listItem = container.querySelector('li');
        expect(listItem?.className).toContain('bg-rose-500/15');
        expect(listItem?.className).toContain('border-rose-500/50');
    });

    it('여유 있는 마감일(D-7) 항목은 붉은색 긴급 배경 클래스가 적용되지 않는다', () => {
        const items = [
            {
                id: 1,
                kind: 'todo' as const,
                text: '여유 있는 할 일',
                completed: false,
                date: todayStr,
                deadline: farFutureStr,
            },
        ];
        const { container } = renderWithRedux(<ItemList kind="todo" />, items);
        const listItem = container.querySelector('li');
        expect(listItem?.className).not.toContain('bg-rose-500/15');
        expect(screen.getByText('D-7')).toBeDefined();
    });

    it('완료된 항목(completed: true)은 마감일이 당일이어도 붉은색 긴급 배경이 해제된다', () => {
        const items = [
            {
                id: 1,
                kind: 'todo' as const,
                text: '완료된 할 일',
                completed: true,
                date: todayStr,
                deadline: todayStr,
            },
        ];
        const { container } = renderWithRedux(<ItemList kind="todo" />, items);
        const listItem = container.querySelector('li');
        expect(listItem?.className).not.toContain('bg-rose-500/15');
    });

    it('체크박스 클릭 시 완료 상태가 토글된다', () => {
        const items = [
            {
                id: 1,
                kind: 'todo' as const,
                text: '토글 테스트 할 일',
                completed: false,
                date: todayStr,
                deadline: todayStr,
            },
        ];
        const { store } = renderWithRedux(<ItemList kind="todo" />, items);
        const checkbox = screen.getByRole('checkbox', { name: '토글 테스트 할 일 완료 여부' });
        fireEvent.click(checkbox);
        expect(store.getState().list.items[0].completed).toBe(true);
    });
});
