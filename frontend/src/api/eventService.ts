import baseApi from './baseApi';
import type { Event, CreateEventRequest, UpdateEventRequest } from '../types/event';
import { getFromStorage, STORAGE_KEYS } from '../utils/localStorage';

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

interface EventsResponse {
  events: Event[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const getAllEvents = async (page = 1, limit = 20): Promise<EventsResponse> => {
  try {
    const response = await baseApi.get<ApiResponse<EventsResponse>>(`/events?page=${page}&limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении мероприятий:', error);
    return {
      events: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1
    };
  }
};

export const getUserEvents = async (): Promise<Event[]> => {
  try {
    const response = await baseApi.get<ApiResponse<Event[]>>('/events/user');
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении мероприятий пользователя:', error);
    return [];
  }
};

export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    const response = await baseApi.get<ApiResponse<Event>>(`/events/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при получении мероприятия:', error);
    return null;
  }
};

export const createEvent = async (eventData: CreateEventRequest): Promise<Event | null> => {
  try {

    const response = await baseApi.post<ApiResponse<Event>>('/events', eventData);
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при создании мероприятия:', error);
    return null;
  }
};


export const updateEvent = async (id: string, eventData: UpdateEventRequest): Promise<Event | null> => {
  try {
    // НЕ передавайте третий аргумент с headers, чтобы Authorization добавлялся автоматически
    
    const response = await baseApi.put<ApiResponse<Event>>(`/events/${id}`, eventData);
    return response.data.data;
  } catch (error) {
    console.error('Ошибка при обновлении мероприятия:', error);
    return null;
  }
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    await baseApi.delete(`/events/${id}`);
    return true;
  } catch (error) {
    console.error('Ошибка при удалении мероприятия:', error);
    return false;
  }
}; 