import reducer, { addBookmark, removeBookmark, setBookmarks } from './bookmarkSlice';
import { Bookmark } from '@/type/bookmark';

describe('bookmarkSlice reducer', () => {
  const initialState: Bookmark[] = [];

  it('초기 상태를 반환해야 함', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual([]);
  });

  it('addBookmark 동작 확인', () => {
    const input = { title: 'Test', url: 'https://test.com' };
    const nextState = reducer(initialState, addBookmark(input));
    
    expect(nextState).toHaveLength(1);
    expect(nextState[0]).toEqual({ ...input, id: 1 });
  });

  it('removeBookmark 동작 확인', () => {
    const state = [{ id: 1, title: 'Test', url: 'https://test.com' }];
    const nextState = reducer(state, removeBookmark(1));
    
    expect(nextState).toHaveLength(0);
  });
});
