import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFavBar } from './useFavBar';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import bookmarkReducer from '@/store/slice/bookmarkSlice';

describe('useFavBar Drag & Drop 테스트', () => {
    it('handleDragEnd 호출 시 순서가 변경되어야 함', () => {
        // 실제 스토어의 bookmarks 슬라이스와 구조를 일치시킴
        const store = configureStore({
            reducer: {
                bookmarks: bookmarkReducer,
            }
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        );
        
        const { result } = renderHook(() => useFavBar(), { wrapper });
        
        // 1. 초기 데이터 주입
        act(() => {
            store.dispatch({ type: 'bookmarks/setBookmarks', payload: [
                { id: 1, title: 'A', url: '' },
                { id: 2, title: 'B', url: '' }
            ]});
        });

        // 2. 드래그 앤 드롭 동작 수행
        act(() => {
            result.current.handleDragEnd({
                active: { id: 1 },
                over: { id: 2 }
            } as any);
        });

        // 3. 훅에서 반환되는 bookmarks 상태값 검증
        expect(result.current.bookmarks).toBeDefined();
        expect(result.current.bookmarks[0].id).toBe(2);
        expect(result.current.bookmarks[1].id).toBe(1);
    });
});
