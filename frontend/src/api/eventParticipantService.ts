import axiosInstance from './axiosConfig';
import type { Participant } from '../types/event';



export const addParticipant = async (eventId: string): Promise<void> => {
    try {
      await axiosInstance.post(`/events/${eventId}/participants`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Необходима авторизация');
      }
      throw error;
    }
  };

export const removeParticipant = async (eventId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/events/${eventId}/participants`);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Необходима авторизация');
    }
    throw error;
  }
};

export const getEventParticipants = async (eventId: string): Promise<Participant[]> => {
    const rawToken = localStorage.getItem('auth_token');
    const token = rawToken ? rawToken.replace(/^"|"$/g, '') : null;
  
    const response = await axiosInstance.get(`/events/${eventId}/participants`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  
    return response.data;
  };

export const getParticipantsCount = async (eventId: string): Promise<number> => {
  try {
    const response = await axiosInstance.get(`/events/${eventId}/participants/count`);
    return response.data.count;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return 0; // В случае ошибки авторизации возвращаем 0
    }
    throw error;
  }
};

export const checkParticipation = async (eventId: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(`/events/${eventId}/participation`);
    return response.data.isParticipant;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return false; // В случае ошибки авторизации считаем, что пользователь не участвует
    }
    throw error;
  }
};
