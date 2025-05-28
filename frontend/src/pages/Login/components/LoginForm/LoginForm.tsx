import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.scss';
import { ErrorMessage } from '../../../../components/ErrorMessage';
import { login } from '../../../../api/authService';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await login({ email, password });
      console.log('Успешный вход, данные пользователя:', response.user);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/events');
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при входе в систему');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1>Вход</h1>
      
      <div className={styles.inputGroup}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Введите ваш email"
          disabled={loading || success}
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Введите ваш пароль"
          disabled={loading || success}
        />
      </div>
      
      <button type="submit" className={styles.button} disabled={loading || success}>
        {loading ? 'Вход...' : success ? 'Вход выполнен!' : 'Войти'}
      </button>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <p className={styles.linkText}>
        Нет аккаунта? <a href="/register">Зарегистрироваться</a>
      </p>
    </form>
  );
}; 