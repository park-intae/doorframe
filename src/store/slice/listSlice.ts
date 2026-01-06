import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadListFromStorage } from '@/thunk/listThunk';

export type ListKind = 'memo' | 'todo';

export interface ListItem {
  id: number;
  kind: ListKind;
  text: string;
  completed?: boolean;
}

interface ListState {
  items: ListItem[];
  nextId: number;
}

// const loadListFromStorage = (): ListState => {
//   if (typeof window === 'undefined') {
//     // 서버 환경에서는 빈 값으로 초기화
//     return {
//       items: [],
//       nextId: 1,
//     };
//   }

//   try {
//     const saved = localStorage.getItem('list');
//     if (saved) return JSON.parse(saved);
//   } catch (e) {
//     console.error('list 불러오기 실패:', e);
//   }
//   return {
//     items: [],
//     nextId: 1,
//   };
// };

const initialState: ListState = {
  items: [],
  nextId: 1,
};

const listSlice = createSlice({
  name: 'list',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ kind: ListKind; text: string }>) => {
      const newItem: ListItem = {
        id: state.nextId++,
        kind: action.payload.kind,
        text: action.payload.text,
        completed: action.payload.kind === 'todo' ? false : undefined,
      };
      state.items.push(newItem);
    },
    toggleItem: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.kind === 'todo') {
        item.completed = !item.completed;
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearItemsByKind: (state, action: PayloadAction<ListKind>) => {
      state.items = state.items.filter((i) => i.kind !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadListFromStorage.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export const { addItem, toggleItem, removeItem, clearItemsByKind } = listSlice.actions;
export default listSlice.reducer;
