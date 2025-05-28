import styles from './Main.module.scss';
import { MainContent } from './components/MainContent';

export const Main = () => {
  return (
    <div className={styles.container}>
      <h1>Главная страница</h1>
      <MainContent />
    </div>
  );
}; 