import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isEventModalOpen: boolean;
  isLoading: boolean;
  notification: {
    message: string;
    type: 'success' | 'error' | 'info' | null;
  };
}

const initialState: UIState = {
  isEventModalOpen: false,
  isLoading: false,
  notification: {
    message: '',
    type: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setEventModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isEventModalOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    showNotification: (
      state,
      action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>
    ) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = { message: '', type: null };
    },
  },
});

export const { setEventModalOpen, setLoading, showNotification, clearNotification } =
  uiSlice.actions;
export default uiSlice.reducer; 