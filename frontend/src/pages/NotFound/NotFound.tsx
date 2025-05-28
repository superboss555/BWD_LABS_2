import { Link } from 'react-router-dom';
import styles from './NotFound.module.scss';

export const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Страница не найдена</p>
        <p className={styles.description}>
          Извините, запрашиваемая страница не существует.
        </p>
        <Link to="/" className={styles.button}>
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}; 