import styles from './MainContent.module.scss';

export const MainContent = () => {
  return (
    <div className={styles.mainContent}>
      <h2>Платформа для мероприятий</h2>
      <p>Добро пожаловать на нашу платформу, где вы можете создавать, находить и участвовать в различных мероприятиях. Присоединяйтесь к сообществу и будьте в курсе всех интересных событий!</p>
      <div className={styles.logoContainer}>
        <img src="/logo.png" alt="Логотип" className={styles.logo} />
      </div>
    </div>
  );
}; 