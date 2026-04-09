import { renderHook, act } from '@testing-library/react';
import { useFavBar } from './useFavBar';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import bookmarkReducer from '@/store/slice/bookmarkSlice';

const renderWithRedux = (hook: () => any) => {
    const store = configureStore({ reducer: { bookmarks: bookmarkReducer } });
    return { ...renderHook(hook, { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> }), store };
};

describe('useFavBar Drag & Drop 테스트', () => {
    it('handleDragEnd 호출 시 순서가 변경되어야 함', () => {
        const { result, store } = renderWithRedux(() => useFavBar());
        
        // 초기 데이터 세팅
        act(() => {
            store.dispatch({ type: 'bookmarks/setBookmarks', payload: [
                { id: 1, title: 'A', url: '' },
                { id: 2, title: 'B', url: '' }
            ]});
        });

        // 드래그 종료 시뮬레이션 (id: 1 -> id: 2 위치로)
        act(() => {
            result.current.handleDragEnd({
                active: { id: 1 },
                over: { id: 2 }
            } as any);
        });

        // 결과 검증: 순서가 [2, 1]로 바뀌었는지 확인
        const updatedBookmarks = store.getState().bookmarks;
        expect(updatedBookmarks[0].id).toBe(2);
        expect(updatedBookmarks[1].id).toBe(1);
    });
});
