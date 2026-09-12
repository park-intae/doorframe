import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CalendarList from './CalendarList';
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

describe('CalendarList 마감일 뱃지 및 긴급 스타일 테스트', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    it('아이템이 없을 때 안내 문구를 노출한다', () => {
        renderWithRedux(<CalendarList items={[]} />);
        expect(screen.getByText('항목이 없습니다')).toBeDefined();
    });

    it('마감일이 설정된 할 일에 마감일 뱃지가 올바르게 노출된다', () => {
        const items = [
            {
                id: 1,
                kind: 'todo' as const,
                text: '캘린더 테스트 할 일',
                completed: false,
                date: todayStr,
                deadline: todayStr,
            },
        ];
        renderWithRedux(<CalendarList items={items} />);
        expect(screen.getByText('캘린더 테스트 할 일')).toBeDefined();
        expect(screen.getByText('D-Day')).toBeDefined();
    });

    it('마감 임박(D-1) 미완료 항목에 붉은색 긴급 스타일이 적용된다', () => {
        const items = [
            {
                id: 1,
                kind: 'todo' as const,
                text: '내일 마감 할 일',
                completed: false,
                date: todayStr,
                deadline: tomorrowStr,
            },
        ];
        const { container } = renderWithRedux(<CalendarList items={items} />);
        const listItem = container.querySelector('li');
        expect(listItem?.className).toContain('bg-rose-500/15');
        expect(listItem?.className).toContain('border-rose-500/50');
    });

    it('완료된 항목(completed: true)은 마감 당일이어도 붉은색 긴급 배경이 해제된다', () => {
        const items = [
            {
                id: 1,
                kind: 'todo' as const,
                text: '완료된 캘린더 할 일',
                completed: true,
                date: todayStr,
                deadline: todayStr,
            },
        ];
        const { container } = renderWithRedux(<CalendarList items={items} />);
        const listItem = container.querySelector('li');
        expect(listItem?.className).not.toContain('bg-rose-500/15');
    });

    it('체크박스 클릭 시 toggleItem 액션이 디스패치된다', () => {
        const items = [
            {
                id: 1,
                kind: 'todo' as const,
                text: '체크박스 테스트',
                completed: false,
                date: todayStr,
            },
        ];
        const { store } = renderWithRedux(<CalendarList items={items} />, items);
        const checkbox = screen.getByRole('checkbox', { name: '체크박스 테스트 완료 여부' });
        fireEvent.click(checkbox);
        expect(store.getState().list.items[0].completed).toBe(true);
    });
});
