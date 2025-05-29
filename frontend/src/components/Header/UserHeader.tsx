import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './Header.module.scss';
import { clearAuth, getFromStorage, STORAGE_KEYS } from '../../utils/localStorage';
import type { User } from '../../types/auth';
import authState from '../../context/AuthState';

const UserHeader = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Пользователь');
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  useEffect(() => {
    // Получение имени пользователя из localStorage
    const updateUserName = () => {
      try {
        const userDataRaw = localStorage.getItem(STORAGE_KEYS.USER);
        
        if (userDataRaw && userDataRaw !== 'undefined' && userDataRaw !== 'null' && userDataRaw.trim() !== '') {
          try {
            const userData = JSON.parse(userDataRaw);
            
            if (userData && userData.name) {
              setUserName(userData.name);
            } else if (userData && userData.email) {
              setUserName(userData.email);
            }
          } catch (parseError) {
            console.error('Ошибка при парсинге данных пользователя:', parseError);
          }
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      }
    };
    
    updateUserName();
    
    const handleLoginEvent = () => updateUserName();
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER || e.key === null) {
        updateUserName();
      }
    };
    const handleAuthStateChange = () => updateUserName();
    
    window.addEventListener('login', handleLoginEvent);
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('auth_state_changed', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('login', handleLoginEvent);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('auth_state_changed', handleAuthStateChange);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    authState.logout();
    setUserName('Пользователь');
    navigate('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

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
            <div className={styles.userDropdown}>
              <button
                className={styles.userDropdownButton}
                onClick={toggleDropdown}
              >
                {userName}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <NavLink
                    to="/profile"
                    className={styles.dropdownLink}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Мой профиль
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                  >
                    Выйти из аккаунта
                  </button>
                </div>
              )}
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
        <div className={styles.userInfo}>
          <p>{userName}</p>
          <NavLink
            to="/profile"
            className={styles.mobileProfileLink}
            onClick={() => setMobileAuthMenuOpen(false)}
          >
            Мой профиль
          </NavLink>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </header>
  );
};

export default UserHeader; 