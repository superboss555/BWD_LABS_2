import baseApi from './baseApi';
import type { Event, CreateEventRequest, UpdateEventRequest } from '../types/event';

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

export const getAllEvents = async (): Promise<Event[]> => {
  try {
    // Используем публичный endpoint для получения мероприятий
    const response = await baseApi.get<ApiResponse<EventsResponse>>('/events');
    return response.data.data.events;
  } catch (error) {
    console.error('Ошибка при получении мероприятий:', error);
    throw error;
  }
};

export const getEventById = async (id: string): Promise<Event> => {
  const response = await baseApi.get<ApiResponse<Event>>(`/events/${id}`);
  return response.data.data;
};

export const createEvent = async (eventData: CreateEventRequest): Promise<Event> => {
  const response = await baseApi.post<ApiResponse<Event>>('/events', eventData);
  return response.data.data;
};

export const updateEvent = async ({ id, ...eventData }: UpdateEventRequest): Promise<Event> => {
  const response = await baseApi.put<ApiResponse<Event>>(`/events/${id}`, eventData);
  return response.data.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await baseApi.delete(`/events/${id}`);
}; 