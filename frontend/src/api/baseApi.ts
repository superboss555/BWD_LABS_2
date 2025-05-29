import axios, { AxiosHeaders } from 'axios';
import { getFromStorage, STORAGE_KEYS } from '../utils/localStorage';

// Загружаем значения из .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = 'qwerty1'; // Хардкодим ключ, как вы просили

const baseApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-api-key': API_KEY,
  },
});

// Добавляем перехватчик для добавления токена авторизации
baseApi.interceptors.request.use(
  (config) => {
    const token = getFromStorage(STORAGE_KEYS.TOKEN);

    if (typeof token === 'string' && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token expires at:', new Date(payload.exp * 1000));
      } catch (e) {
        console.warn('Не удалось распарсить токен', e);
      }

      if (config.headers instanceof AxiosHeaders) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else if (config.headers) {
        // Если headers — обычный объект, создаём AxiosHeaders из него
        const headers = new AxiosHeaders(config.headers);
        headers.set('Authorization', `Bearer ${token}`);
        config.headers = headers;
      } else {
        // Если headers отсутствуют, создаём новый AxiosHeaders
        config.headers = new AxiosHeaders({ Authorization: `Bearer ${token}` });
      }
    }

    console.log('=== Request Debug ===');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Headers:', config.headers);

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);


// Добавляем перехватчик для обработки ошибок
baseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Response error:', error.response.data);
      // Если сервер вернул ошибку авторизации
      if (error.response.status === 401) {
        console.error('Authentication error:', error.response.data);
      }
    }
    return Promise.reject(error);
  },
);

export default baseApi;
