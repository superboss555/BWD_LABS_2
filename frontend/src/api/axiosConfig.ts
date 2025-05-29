import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Создаем экземпляр axios с базовым URL
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Инициализируем заголовки при создании экземпляра
const token = localStorage.getItem('auth_token');
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Добавляем перехватчик запросов
axiosInstance.interceptors.request.use(
  (config) => {
    const rawToken = localStorage.getItem('auth_token');
    // Убираем кавычки, если они есть
    const token = rawToken ? rawToken.replace(/^"|"$/g, '') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-api-key'] = 'qwerty1';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 