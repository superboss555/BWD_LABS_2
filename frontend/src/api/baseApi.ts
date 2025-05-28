import axios from 'axios';
import { getFromStorage, STORAGE_KEYS } from '../utils/localStorage';

// Базовый URL можно также загружать из .env файла: import.meta.env.VITE_API_URL
const API_URL = 'http://localhost:3000';

const baseApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик запросов для включения токена авторизации
baseApi.interceptors.request.use(
  (config) => {
    const token = getFromStorage<string>(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default baseApi; 