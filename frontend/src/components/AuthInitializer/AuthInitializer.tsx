import { useEffect, type ReactNode } from 'react';
import { getFromStorage, STORAGE_KEYS } from '../../utils/localStorage';
import type { User } from '../../types/auth';
import authState from '../../context/AuthState';

interface AuthInitializerProps {
  children: ReactNode;
}

const AuthInitializer = ({ children }: AuthInitializerProps) => {
  useEffect(() => {
    const initAuth = () => {
      const userData = getFromStorage<User>(STORAGE_KEYS.USER);
      
      if (userData) {
        authState.login(userData);
      }
    };

    initAuth();
  }, []);

  return <>{children}</>;
};

export default AuthInitializer; 