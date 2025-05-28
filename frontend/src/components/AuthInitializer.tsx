import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import { getFromStorage, STORAGE_KEYS } from '../utils/localStorage';
import type { User } from '../types/auth';

export const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = getFromStorage<User>(STORAGE_KEYS.USER);
    if (user) {
      dispatch(setUser(user));
    }
  }, [dispatch]);

  return null;
};

export default AuthInitializer; 