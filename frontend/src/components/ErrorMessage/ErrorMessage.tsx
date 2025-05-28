import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './ErrorMessage.module.scss';

interface ErrorMessageProps {
  children: ReactNode;
}

export const ErrorMessage = ({ children }: ErrorMessageProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Автоматически скрыть ошибку через 5 секунд
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.error}>
      {children}
      <button 
        className={styles.closeButton} 
        onClick={() => setVisible(false)}
        title="Закрыть"
      >
        ×
      </button>
    </div>
  );
}; 