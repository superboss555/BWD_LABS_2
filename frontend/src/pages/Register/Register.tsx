import styles from './Register.module.scss';
import { RegisterForm } from './components/RegisterForm';

export const Register = () => {
  return (
    <div className={styles.container}>
      <RegisterForm />
    </div>
  );
}; 