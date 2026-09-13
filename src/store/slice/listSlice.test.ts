import reducer, { addItem, toggleItem, ListKind } from './listSlice';

describe('listSlice reducer 철저한 검증', () => {
    const initialState = {
        items: [],
        nextId: 1,
    };

    it('addItem 시 데이터 구조의 무결성 검증', () => {
        const payload = { kind: 'todo' as ListKind, text: '  공백 포함 텍스트  ' };
        const nextState = reducer(initialState, addItem(payload));
        
        expect(nextState.items[0]).toMatchObject({
            id: 1,
            kind: 'todo',
            text: '  공백 포함 텍스트  ',
            completed: false
        });
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
});
