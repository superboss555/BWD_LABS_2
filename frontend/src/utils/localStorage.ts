export const saveToStorage = (key: string, value: any): void => {
  try {
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Ошибка при сохранении в localStorage:', error);
  }
};

export const getFromStorage = <T>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key);
    
    if (value === null || 
        value === undefined || 
        value === 'undefined' || 
        value === 'null' || 
        value.trim() === '') {
      return null;
    }
    
    try {
      return JSON.parse(value) as T;
    } catch (parseError) {
      console.error(`Ошибка при парсинге данных из localStorage: ${parseError}`);
      
      localStorage.removeItem(key);
      return null;
    }
  } catch (error) {
    console.error(`Ошибка при получении из localStorage: ${error}`);
    return null;
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Ошибка при удалении из localStorage:', error);
  }
};

// Константы для ключей хранилища
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data'
};

export const getUserData = () => {
  return getFromStorage(STORAGE_KEYS.USER);
};

export const clearAuth = () => {
  removeFromStorage(STORAGE_KEYS.TOKEN);
  removeFromStorage(STORAGE_KEYS.USER);
  window.dispatchEvent(new CustomEvent('logout'));
}; 