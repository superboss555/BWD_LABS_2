import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './Header.module.scss';

const GuestHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAuthMenuOpen, setMobileAuthMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
        setMobileAuthMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (mobileAuthMenuOpen) setMobileAuthMenuOpen(false);
  };

  const toggleAuthMenu = () => {
    setMobileAuthMenuOpen(!mobileAuthMenuOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.logo}>
        Event Platform
      </NavLink>

      {!isMobile && (
        <>
          <nav className={styles.nav}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Главная
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Мероприятия
            </NavLink>
          </nav>

          <div className={styles.authButtons}>
            <div className={styles.authLinks}>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                Вход
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                Регистрация
              </NavLink>
            </div>
          </div>
        </>
      )}

      {isMobile && (
        <div className={styles.mobileControls}>
          <button 
            className={styles.mobileMenuButton} 
            onClick={toggleMobileMenu}
            aria-label="Меню"
          >
            <span className={styles.burgerIcon}></span>
          </button>

          <button
            className={styles.accountButton}
            onClick={toggleAuthMenu}
            aria-label="Аккаунт"
          >
            <span className={styles.accountIcon}></span>
          </button>
        </div>
      )}

      {/* Мобильное навигационное меню */}
      <nav className={`${styles.mobileNav} ${mobileMenuOpen ? styles.open : ''}`}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
          onClick={() => setMobileMenuOpen(false)}
        >
          Главная
        </NavLink>
        <NavLink
          to="/events"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
          onClick={() => setMobileMenuOpen(false)}
        >
          Мероприятия
        </NavLink>
      </nav>

      {/* Мобильное меню аккаунта */}
      <div className={`${styles.mobileAuthMenu} ${mobileAuthMenuOpen ? styles.open : ''}`}>
        <div className={styles.authLinks}>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            onClick={() => setMobileAuthMenuOpen(false)}
          >
            Вход
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            onClick={() => setMobileAuthMenuOpen(false)}
          >
            Регистрация
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default GuestHeader; 