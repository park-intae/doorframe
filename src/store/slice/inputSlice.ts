import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InputState {
  value: string;
  targetDate?: string;
}

const initialState: InputState = { value: '', targetDate: undefined };

const inputSlice = createSlice({
  name: 'input',
  initialState,
  reducers: {
    setInputValue: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    setTargetDate: (state, action: PayloadAction<string | undefined>) => {
      state.targetDate = action.payload;
    },
    clearInput: (state) => {
      state.value = '';
      state.targetDate = undefined;
    },
  },
});

export const { setInputValue, setTargetDate, clearInput } = inputSlice.actions;
export default inputSlice.reducer;
