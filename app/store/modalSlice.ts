import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModalType } from 'app/type/modal';

interface ModalState {
  name: ModalType;
}

const initialState: ModalState = {
  name: null,
};

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<ModalType>) => {
      state.name = action.payload;
    },
    closeModal: (state) => {
      state.name = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
