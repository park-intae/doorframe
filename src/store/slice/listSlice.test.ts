import reducer, {
  addItem,
  toggleItem,
  removeItem,
  clearItemsByKind,
  ListKind,
} from './listSlice';
import { describe, it, expect } from 'vitest';

describe('listSlice reducer 철저한 검증', () => {
  const initialState = {
    items: [],
    nextId: 1,
  };

  it('addItem 시 데이터 구조의 무결성 검증 (기본값 및 사용자 지정 date/deadline)', () => {
    const payload = {
      kind: 'todo' as ListKind,
      text: '  공백 포함 텍스트  ',
      date: '2026-10-01',
      deadline: '2026-10-05',
    };
    const nextState = reducer(initialState, addItem(payload));

    expect(nextState.items[0]).toMatchObject({
      id: 1,
      kind: 'todo',
      text: '  공백 포함 텍스트  ',
      date: '2026-10-01',
      deadline: '2026-10-05',
      completed: false,
    });
  });

  it('존재하는 id로 toggleItem 호출 시 완료 여부가 반전되어야 함', () => {
    const state = {
      items: [{ id: 1, kind: 'todo' as ListKind, text: '할일', completed: false }],
      nextId: 2,
    };
    const toggledState = reducer(state, toggleItem(1));
    expect(toggledState.items[0].completed).toBe(true);

    const reToggledState = reducer(toggledState, toggleItem(1));
    expect(reToggledState.items[0].completed).toBe(false);
  });

  it('존재하지 않는 id로 toggleItem 호출 시 상태 변화 없어야 함', () => {
    const state = {
      items: [{ id: 1, kind: 'todo' as ListKind, text: 'todo', completed: false }],
      nextId: 2,
    };
    const nextState = reducer(state, toggleItem(999));
    expect(nextState).toEqual(state);
  });

  it('memo 타입 아이템은 completed 속성이 없어야 함', () => {
    const nextState = reducer(initialState, addItem({ kind: 'memo', text: '메모' }));
    expect(nextState.items[0]).not.toHaveProperty('completed');
  });

  it('removeItem으로 특정 아이템을 삭제할 수 있어야 함', () => {
    const state = {
      items: [
        { id: 1, kind: 'todo' as ListKind, text: '할일 1' },
        { id: 2, kind: 'todo' as ListKind, text: '할일 2' },
      ],
      nextId: 3,
    };
    const nextState = reducer(state, removeItem(1));
    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0].id).toBe(2);
  });

  it('clearItemsByKind로 특정 종류의 모든 아이템을 일괄 삭제할 수 있어야 함', () => {
    const state = {
      items: [
        { id: 1, kind: 'todo' as ListKind, text: '할일 1' },
        { id: 2, kind: 'memo' as ListKind, text: '메모 1' },
        { id: 3, kind: 'todo' as ListKind, text: '할일 2' },
      ],
      nextId: 4,
    };
    const nextState = reducer(state, clearItemsByKind('todo'));
    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0].kind).toBe('memo');
  });

  it('loadListFromStorage.fulfilled 시 전달받은 상태로 완전히 교체되어야 함', () => {
    const loadedData = {
      items: [{ id: 10, kind: 'memo' as ListKind, text: '불러온 메모' }],
      nextId: 11,
    };
    const nextState = reducer(initialState, {
      type: 'list/load/fulfilled',
      payload: loadedData,
    });
    expect(nextState).toEqual(loadedData);
  });
});
