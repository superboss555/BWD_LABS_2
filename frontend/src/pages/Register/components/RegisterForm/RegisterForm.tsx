import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterForm.module.scss';
import { ErrorMessage } from '../../../../components/ErrorMessage';
import { register } from '../../../../api/authService';

export const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await register({ name, email, password });
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (err) {
      console.error('Register error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1>Регистрация</h1>
      
      <div className={styles.inputGroup}>
        <label htmlFor="name">Имя пользователя</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Введите ваше имя"
          disabled={loading || success}
        />
      </div>
      
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
          placeholder="Введите пароль"
          disabled={loading || success}
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="confirmPassword">Подтвердите пароль</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Повторите пароль"
          disabled={loading || success}
        />
      </div>
      
      <button type="submit" className={styles.button} disabled={loading || success}>
        {loading ? 'Регистрация...' : success ? 'Регистрация выполнена!' : 'Зарегистрироваться'}
      </button>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <p className={styles.linkText}>
        Уже есть аккаунт? <a href="/login">Войти</a>
      </p>
    </form>
  );
}; 