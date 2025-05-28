import { useEffect, useState } from 'react';
import GuestHeader from './GuestHeader';
import UserHeader from './UserHeader';
import authState from '../../context/AuthState';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authState.isAuthenticated);

  useEffect(() => {
    // Проверяем начальное состояние авторизации
    setIsAuthenticated(authState.isAuthenticated);
    
    // Подписываемся на изменения авторизации
    const handleAuthChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsAuthenticated(customEvent.detail);
    };
    
    window.addEventListener('auth_state_changed', handleAuthChanged);
    
    return () => {
      window.removeEventListener('auth_state_changed', handleAuthChanged);
    };
  }, []);

  return isAuthenticated ? <UserHeader /> : <GuestHeader />;
};

export default Header; 