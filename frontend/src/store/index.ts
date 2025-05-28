import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.ts';
import eventsReducer from './slices/eventsSlice.ts';
import uiReducer from './slices/uiSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>; 