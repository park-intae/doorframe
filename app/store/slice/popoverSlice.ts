import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PopoverType } from 'app/type/popover';

interface PopoverState {
  name: PopoverType | null;
  anchor: HTMLElement | null;
}

const initialState: PopoverState = {
  name: null,
  anchor: null,
};

const popoverSlice = createSlice({
  name: 'popover',
  initialState,
  reducers: {
    openPopover: (state, action: PayloadAction<{ name: PopoverType; anchor: HTMLElement }>) => {
      state.name = action.payload.name;
    },
    closePopover: (state) => {
      state.name = null;
    },
  },
});

export const { openPopover, closePopover } = popoverSlice.actions;
export default popoverSlice.reducer;
