import baseApi from './baseApi';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import { saveToStorage, STORAGE_KEYS, removeFromStorage } from '../utils/localStorage';
import authState from '../context/AuthState';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await baseApi.post<AuthResponse>('/auth/login', data);
    
    if (response.data && response.data.data) {
      const { accessToken, user } = response.data.data;
      
      if (!accessToken) {
        console.error('Ошибка: токен отсутствует в ответе сервера');
        throw new Error('Токен отсутствует в ответе сервера');
      }
      
      // Сохраняем данные в localStorage
      saveToStorage(STORAGE_KEYS.TOKEN, accessToken);
      saveToStorage(STORAGE_KEYS.USER, user);
      
      // Обновляем состояние авторизации
      authState.login(user);
      
      // Отправляем события для обновления UI
      window.dispatchEvent(new CustomEvent('login'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.USER,
        newValue: JSON.stringify(user)
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
    
    if (response.data && response.data.data) {
      const { accessToken, user } = response.data.data;
      saveToStorage(STORAGE_KEYS.TOKEN, accessToken);
      saveToStorage(STORAGE_KEYS.USER, user);
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
    window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: false }));
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
    
    if (response.data && response.data.data) {
      const { user } = response.data.data;
      saveToStorage(STORAGE_KEYS.USER, user);
      
      authState.login(user);
      
      // Отправляем события для обновления UI
      window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: true }));
      window.dispatchEvent(new CustomEvent('login'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: STORAGE_KEYS.USER,
        newValue: JSON.stringify(user)
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Ошибка получения текущего пользователя:', error);
    throw error;
  }
}; 