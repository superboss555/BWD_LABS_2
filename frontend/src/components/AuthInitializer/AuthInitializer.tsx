import { useEffect } from 'react';
import { getFromStorage, STORAGE_KEYS } from '../../utils/localStorage';
import type { User } from '../../types/auth';
import authState from '../../context/AuthState';

export const AuthInitializer = () => {
  useEffect(() => {
    const initAuth = () => {
      const userData = getFromStorage<User>(STORAGE_KEYS.USER);
      
      if (userData) {
        authState.login(userData);
      }
    };

    initAuth();
  }, []);

  return null;
}; 