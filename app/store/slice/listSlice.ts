import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
});

export const { addItem, toggleItem, removeItem, clearItemsByKind } = listSlice.actions;
export default listSlice.reducer;
