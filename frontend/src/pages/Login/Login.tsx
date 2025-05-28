import styles from './Login.module.scss';
import { LoginForm } from './components/LoginForm';

export const Login = () => {
  return (
    <div className={styles.container}>
      <LoginForm />
    </div>
  );
}; 