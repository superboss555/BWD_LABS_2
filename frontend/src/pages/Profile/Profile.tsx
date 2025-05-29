import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserEvents } from '../../api/eventService';
import { getFromStorage, STORAGE_KEYS } from '../../utils/localStorage';
import type { Event, Participant } from '../../types/event';
import type { User } from '../../types/auth';
import styles from './Profile.module.scss';
import { EventCard } from '../../components/EventCard';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { Button, Modal, Box, Typography } from '@mui/material';

export const Profile = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Для модального окна участников
  const [participantsList, setParticipantsList] = useState<Participant[]>([]);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [modalEventTitle, setModalEventTitle] = useState('');

  useEffect(() => {
    console.log(
      '[Profile] useEffect: Проверяем данные пользователя в localStorage...',
    );
    const userData = getFromStorage<User>(STORAGE_KEYS.USER);
    console.log('[Profile] Полученные данные пользователя:', userData);

    if (!userData) {
      console.warn(
        '[Profile] Пользователь не найден в localStorage, перенаправляем на /login',
      );
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
        console.error(
          '[Profile] Ошибка при получении мероприятий пользователя:',
          err,
        );
        setError('Не удалось загрузить мероприятия');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [navigate]);

  // Функция для обновления списка после удаления мероприятия
  const handleEventDeleted = (deletedEventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== deletedEventId),
    );
  };

  // Открыть модальное окно с участниками
  const openParticipantsModal = async (eventId: string, eventTitle: string) => {
    try {
      // Импортируйте и используйте API для получения участников
      const { getEventParticipants } = await import(
        '../../api/eventParticipantService'
      );
      const participants = await getEventParticipants(eventId);
      setParticipantsList(participants);
      setModalEventTitle(eventTitle);
      setIsParticipantsModalOpen(true);
    } catch {
      alert('Ошибка при загрузке списка участников');
    }
  };

  const closeParticipantsModal = () => {
    setIsParticipantsModalOpen(false);
    setParticipantsList([]);
    setModalEventTitle('');
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
            <p>
              <strong>Имя:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
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
            <p className={styles.noEvents}>
              У вас пока нет созданных мероприятий
            </p>
          ) : (
            <div className={styles.eventsList}>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  currentUser={currentUser}
                  showActions={true}
                  onDeleteSuccess={() => handleEventDeleted(event.id)}
                  onOpenParticipants={openParticipantsModal} // Передаем функцию открытия модального окна
                />
              ))}
            </div>
          )
        ) : (
          <p>Для просмотра мероприятий необходимо войти в систему.</p>
        )}
      </div>

      {/* Модальное окно со списком участников */}
      <Modal
        open={isParticipantsModalOpen}
        onClose={closeParticipantsModal}
        aria-labelledby="participants-modal-title"
        aria-describedby="participants-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Typography
            id="participants-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Участники мероприятия: {modalEventTitle}
          </Typography>
          {participantsList.length === 0 ? (
            <Typography>Нет участников</Typography>
          ) : (
            participantsList.map((participant, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="subtitle1">
                  {participant.User?.name || 'Без имени'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {participant.User?.email || 'Без email'}
                </Typography>
              </Box>
            ))
          )}
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button onClick={closeParticipantsModal}>Закрыть</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Profile;
