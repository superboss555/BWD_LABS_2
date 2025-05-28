import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserEvents } from '../../api/eventService';
import { getFromStorage, STORAGE_KEYS } from '../../utils/localStorage';
import type { Event } from '../../types/event';
import type { User } from '../../types/auth';
import styles from './Profile.module.scss';
import { EventCard } from '../../components/EventCard';

export const Profile = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[Profile] useEffect: Проверяем данные пользователя в localStorage...');
    const userData = getFromStorage<User>(STORAGE_KEYS.USER);
    console.log('[Profile] Полученные данные пользователя:', userData);

    if (!userData) {
      console.warn('[Profile] Пользователь не найден в localStorage, перенаправляем на /login');
      navigate('/login');
      return;
    }

    setUser(userData);

    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        console.log('[Profile] Запрос мероприятий пользователя...');
        const userEvents = await getUserEvents();
        console.log('[Profile] Получены мероприятия:', userEvents);
        setEvents(userEvents);
        setError(null);
      } catch (err) {
        console.error('[Profile] Ошибка при получении мероприятий пользователя:', err);
        setError('Не удалось загрузить мероприятия');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [navigate]);

  // Функция для обновления списка после удаления мероприятия
  const handleEventDeleted = (deletedEventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== deletedEventId));
  };
  

  if (loading) {
    console.log('[Profile] Загрузка...');
    return <div className={styles.loading}>Загрузка...</div>;
  }

  console.log('[Profile] Рендер профиля, пользователь:', user);

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Профиль пользователя</h1>
        {user ? (
          <div className={styles.userInfo}>
            <p><strong>Имя:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        ) : (
          <p>Пользователь не авторизован</p>
        )}
      </div>

      <div className={styles.eventsSection}>
        <h2>Мои мероприятия</h2>
        {error && <div className={styles.error}>{error}</div>}

        {user ? (
          events.length === 0 ? (
            <p className={styles.noEvents}>У вас пока нет созданных мероприятий</p>
          ) : (
            <div className={styles.eventsList}>
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  showActions={true}
                  onDeleteSuccess={() => handleEventDeleted(event.id)}
                />
              ))}
            </div>
          )
        ) : (
          <p>Для просмотра мероприятий необходимо войти в систему.</p>
        )}
      </div>
    </div>
  );
};
