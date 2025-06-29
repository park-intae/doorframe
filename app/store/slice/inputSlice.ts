import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface inputState {
  value: string;
}

const initialState: inputState = {
  value: '',
};

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
