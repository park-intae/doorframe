import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PopoverType } from '@/type/popover';

interface PopoverState {
  name: PopoverType | null;
  anchorRect: DOMRect | null;
}

const initialState: PopoverState = {
  name: null,
  anchorRect: null,
};

const popoverSlice = createSlice({
  name: 'popover',
  initialState,
  reducers: {
    openPopover: (state, action: PayloadAction<{ name: PopoverType; anchor: HTMLElement }>) => {
      state.name = action.payload.name;
      const rect = action.payload.anchor.getBoundingClientRect();
      state.anchorRect = {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
      } as DOMRect;
    },
    closePopover: (state) => {
      state.name = null;
      state.anchorRect = null;
    },
  },
});

export const { openPopover, closePopover } = popoverSlice.actions;
export default popoverSlice.reducer;
