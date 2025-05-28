import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllEvents, getUserEvents, createEvent as createEventApi, updateEvent as updateEventApi, deleteEvent as deleteEventApi } from '../../api/eventService';
import type { CreateEventRequest, Event } from '../../types/event';

interface EventsState {
  items: Event[];
  userEvents: Event[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

const initialState: EventsState = {
  items: [],
  userEvents: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 0,
  itemsPerPage: 10
};

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (_, { getState }) => {
    const state = getState() as { events: EventsState };
    const { currentPage, itemsPerPage } = state.events;
    const response = await getAllEvents(currentPage, itemsPerPage);
    return response;
  }
);

export const fetchUserEvents = createAsyncThunk(
  'events/fetchUserEvents',
  async () => {
    return await getUserEvents();
  }
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (eventData: CreateEventRequest, { dispatch }) => {
    // НЕ добавляем createdBy, сервер сам определит создателя из токена
    const newEvent = await createEventApi(eventData);
    await Promise.all([
      dispatch(fetchEvents()),
      dispatch(fetchUserEvents())
    ]);
    return newEvent;
  }
);


export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, eventData }: { id: string; eventData: Partial<Event> }, { dispatch }) => {
    const updateData = {
      id,
      ...eventData
    };
    const updatedEvent = await updateEventApi(id, updateData);
    // Дожидаемся обновления списков перед возвратом
    await Promise.all([
      dispatch(fetchEvents()),
      dispatch(fetchUserEvents())
    ]);
    return updatedEvent;
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: string, { dispatch }) => {
    await deleteEventApi(id);
    // Дожидаемся обновления списков перед возвратом
    await Promise.all([
      dispatch(fetchEvents()),
      dispatch(fetchUserEvents())
    ]);
    return id;
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Сброс на первую страницу при изменении количества элементов
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        console.log('Получены мероприятия после обновления:', action.payload.events);

        state.loading = false;
        state.items = action.payload.events;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки мероприятий';
      })
      .addCase(fetchUserEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.userEvents = action.payload;
        state.error = null;
      })
      .addCase(fetchUserEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки мероприятий пользователя';
        state.userEvents = [];
      })
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка при создании мероприятия';
      })
      .addCase(updateEvent.fulfilled, () => {
        // Обновление происходит через dispatch
      })
      .addCase(deleteEvent.fulfilled, () => {
        // Обновление происходит через dispatch
      });
  },
});

export const { clearError, setPage, setItemsPerPage } = eventsSlice.actions;
export default eventsSlice.reducer; 