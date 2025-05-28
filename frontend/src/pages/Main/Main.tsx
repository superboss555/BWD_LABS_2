import { Link } from 'react-router-dom';
import styles from './Main.module.scss';

export const Main = () => {
  return (
    <div className={styles.container}>
      <h1>Добро пожаловать в Event Platform</h1>
      <p>Платформа для создания и управления мероприятиями</p>
      
      <div className={styles.features}>
        <div className={styles.feature}>
          <h2>Создавайте мероприятия</h2>
          <p>Легко создавайте и управляйте своими мероприятиями</p>
          <Link to="/events" className={styles.button}>Перейти к мероприятиям</Link>
        </div>
        
        <div className={styles.feature}>
          <h2>Управляйте участниками</h2>
          <p>Отслеживайте количество участников и управляйте регистрациями</p>
          <Link to="/profile" className={styles.button}>Мой профиль</Link>
        </div>
      </div>
    </div>
  );
}; 