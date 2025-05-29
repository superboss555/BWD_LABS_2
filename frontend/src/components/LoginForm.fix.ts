import { useState, useEffect } from 'react';
import authState from '../context/AuthState';
import type { User } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(authState.userData);
  const [isAuthenticated, setIsAuthenticated] = useState(authState.isAuthenticated);

  useEffect(() => {
    const handleAuthChange = (event: CustomEvent<boolean>) => {
      setIsAuthenticated(event.detail);
      setUser(authState.userData);
    };

    window.addEventListener('auth_state_changed', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('auth_state_changed', handleAuthChange as EventListener);
    };
  }, []);

  return { user, isAuthenticated };
};
