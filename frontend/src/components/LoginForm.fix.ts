import { useEffect } from 'react';
import { getFromStorage, STORAGE_KEYS } from '../utils/localStorage';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/auth';

export const useAuthFix = () => {
  const { setUser } = useAuth();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = getFromStorage<User>(STORAGE_KEYS.USER);
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEYS.USER && e.newValue) {
        checkAuth();
      }
    });

    return () => {
      window.removeEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.USER) {
          checkAuth();
        }
      });
    };
  }, [setUser]);
}; 