import baseApi from './baseApi';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import { saveToStorage, STORAGE_KEYS, removeFromStorage } from '../utils/localStorage';
import authState from '../context/AuthState';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await baseApi.post<AuthResponse>('/auth/login', data);
    
    if (response.data) {
      // Проверяем валидность ответа сервера
      if (!response.data.token) {
        console.error('Ошибка: токен отсутствует в ответе сервера');
      }
      
      // Сохраняем данные в localStorage
      saveToStorage(STORAGE_KEYS.TOKEN, response.data.token);
      saveToStorage(STORAGE_KEYS.USER, response.data.user);
      
      // Обновляем состояние авторизации
      authState.login(response.data.user);
      
      // Отправляем события для обновления UI
      window.dispatchEvent(new CustomEvent('login'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.USER,
        newValue: JSON.stringify(response.data.user)
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    throw error;
  }
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await baseApi.post<AuthResponse>('/auth/register', data);
    
    if (response.data) {
      saveToStorage(STORAGE_KEYS.TOKEN, response.data.token);
      saveToStorage(STORAGE_KEYS.USER, response.data.user);
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    throw error;
  }
};

export const logout = (): void => {
  try {
    removeFromStorage(STORAGE_KEYS.TOKEN);
    removeFromStorage(STORAGE_KEYS.USER);
    
    authState.logout();
    
    // Отправляем события для обновления UI
    window.dispatchEvent(new CustomEvent('logout'));
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.USER,
      newValue: null
    }));
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error);
  }
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    const response = await baseApi.get<AuthResponse>('/auth/me');
    
    if (response.data && response.data.user) {
      saveToStorage(STORAGE_KEYS.USER, response.data.user);
      
      authState.login(response.data.user);
      
      // Отправляем события для обновления UI
      window.dispatchEvent(new CustomEvent('login'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.USER,
        newValue: JSON.stringify(response.data.user)
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка получения текущего пользователя:', error);
    throw error;
  }
}; 