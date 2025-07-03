import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface inputState {
  value: string;
}

const loadInputFromStorage = (): inputState => {
  try {
    const saved = localStorage.getItem('input');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('input 불러오기 실패:', e);
  }
  return {
    value: '',
  };
};

const initialState: inputState = loadInputFromStorage();

const inputSlice = createSlice({
  name: 'input',
  initialState,
  reducers: {
    setInputValue: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    clearInput: (state) => {
      state.value = '';
    },
  },
});

export const { setInputValue, clearInput } = inputSlice.actions;
export default inputSlice.reducer;
