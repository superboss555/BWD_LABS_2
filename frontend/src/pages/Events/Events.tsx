import { useEffect, useState, useCallback } from 'react';
import {
  getAllEvents,
  createEvent,
  deleteEvent,
  updateEvent,
} from '../../api/eventService';
import {
  getFromStorage,
  saveToStorage,
  STORAGE_KEYS,
} from '../../utils/localStorage';
import {
  getParticipantsCount,
  getEventParticipants,
  checkParticipation,
  addParticipant,
  removeParticipant,
} from '../../api/eventParticipantService';
import type {
  Event as AppEvent,
  CreateEventRequest,
  Participant,
} from '../../types/event';
import type { User } from '../../types/auth';
import styles from './Events.module.scss';
import DiceRoller from '../../components/DiceRoller';
import { Button, Modal, Box, Typography } from '@mui/material';


const STORAGE_EVENTS_KEY = 'events_storage';

const Events = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<AppEvent[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Модальное окно и форма
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<CreateEventRequest>({
    title: '',
    description: '',
    date: '',
  });

  // Новые состояния для участников
  const [participantsCountMap, setParticipantsCountMap] = useState<
    Record<string, number>
  >({});
  const [participantsList, setParticipantsList] = useState<Participant[]>([]);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [modalEventTitle, setModalEventTitle] = useState('');

  // Статусы участия пользователей и загрузка кнопок
  const [participationMap, setParticipationMap] = useState<
    Record<string, boolean>
  >({});
  const [loadingParticipation, setLoadingParticipation] = useState<
    Record<string, boolean>
  >({});

  const isAuthenticated = !!user && !!user.id;

  // Функции для работы с localStorage
  const loadEventsFromStorage = (): AppEvent[] => {
    const storedEvents = getFromStorage<AppEvent[]>(STORAGE_EVENTS_KEY);
    return storedEvents || [];
  };

  const saveEventsToStorage = (eventsToSave: AppEvent[]) => {
    saveToStorage(STORAGE_EVENTS_KEY, eventsToSave);
  };

  // Обновление пользователя из localStorage
  const updateUserState = useCallback(() => {
    try {
      const rawUserData = localStorage.getItem(STORAGE_KEYS.USER);
      if (rawUserData && rawUserData !== 'undefined') {
        try {
          const userData = JSON.parse(rawUserData) as User;
          if (userData && userData.id) {
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (parseError) {
          console.error('Ошибка при парсинге данных пользователя:', parseError);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Ошибка при чтении данных пользователя:', error);
      setUser(null);
    }
  }, []);

  // Загрузка событий с сервера и сохранение в localStorage
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const eventsData = await getAllEvents(currentPage, itemsPerPage);

      setEvents(eventsData.events);
      saveEventsToStorage(eventsData.events);

      const calculatedTotalPages =
        Math.ceil(eventsData.totalCount / itemsPerPage) || 1;
      setTotalPages(calculatedTotalPages);
    } catch (err) {
      console.error('Ошибка при загрузке мероприятий:', err);
      setError('Не удалось загрузить мероприятия');

      const cachedEvents = loadEventsFromStorage();
      if (cachedEvents.length > 0) {
        setEvents(cachedEvents);
        setTotalPages(Math.ceil(cachedEvents.length / itemsPerPage) || 1);
      } else {
        setEvents([]);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  };

  // Загрузка количества участников для отображаемых событий
  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        displayedEvents.map(async (event) => {
          try {
            const count = await getParticipantsCount(event.id);
            counts[event.id] = count;
          } catch {
            counts[event.id] = 0;
          }
        }),
      );
      setParticipantsCountMap(counts);
    };
    fetchCounts();
  }, [displayedEvents]);

  // Загрузка статусов участия текущего пользователя
  useEffect(() => {
    if (!isAuthenticated) {
      setParticipationMap({});
      return;
    }
    const fetchParticipationStatus = async () => {
      const map: Record<string, boolean> = {};
      await Promise.all(
        displayedEvents.map(async (event) => {
          try {
            const isPart = await checkParticipation(event.id);
            map[event.id] = isPart;
          } catch {
            map[event.id] = false;
          }
        }),
      );
      setParticipationMap(map);
    };
    fetchParticipationStatus();
  }, [displayedEvents, isAuthenticated]);

  const openParticipantsModal = async (eventId: string, eventTitle: string) => {
    try {
      const participants = await getEventParticipants(eventId);
      console.log('Полученные участники:', participants);

      if (!Array.isArray(participants)) {
        alert('Ошибка: данные участников имеют неверный формат');
        setParticipantsList([]);
        return;
      }

      setParticipantsList(participants);
      setModalEventTitle(eventTitle);
      setIsParticipantsModalOpen(true);
    } catch (error) {
      console.error('Ошибка при загрузке списка участников:', error);
      alert('Ошибка при загрузке списка участников');
    }
  };

  const closeParticipantsModal = () => {
    setIsParticipantsModalOpen(false);
    setParticipantsList([]);
    setModalEventTitle('');
  };

  // Обработка участия пользователя
  const handleParticipateClick = async (eventId: string) => {
    if (!isAuthenticated) {
      alert('Пожалуйста, авторизуйтесь, чтобы участвовать в мероприятии.');
      return;
    }

    setLoadingParticipation((prev) => ({ ...prev, [eventId]: true }));

    try {
      if (participationMap[eventId]) {
        // Отмена участия
        await removeParticipant(eventId);
        setParticipationMap((prev) => ({ ...prev, [eventId]: false }));
        setParticipantsCountMap((prev) => ({
          ...prev,
          [eventId]: Math.max((prev[eventId] ?? 1) - 1, 0),
        }));
        alert('Вы отменили участие в мероприятии');
      } else {
        // Регистрация
        await addParticipant(eventId);
        setParticipationMap((prev) => ({ ...prev, [eventId]: true }));
        setParticipantsCountMap((prev) => ({
          ...prev,
          [eventId]: (prev[eventId] ?? 0) + 1,
        }));
        alert('Вы успешно зарегистрировались на мероприятие');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка при изменении участия');
    } finally {
      setLoadingParticipation((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  useEffect(() => {
    updateUserState();
    fetchEvents();

    const handleLogin = (e: CustomEvent) => {
      updateUserState();
    };

    const handleLogout = () => {
      setUser(null);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER || e.key === STORAGE_KEYS.TOKEN) {
        updateUserState();
      }
    };

    window.addEventListener('login', handleLogin as EventListener);
    window.addEventListener('logout', handleLogout);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('login', handleLogin as EventListener);
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateUserState]);

  // Обновляем totalPages и currentPage при изменении itemsPerPage или длины events
  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(events.length / itemsPerPage));
    setTotalPages(newTotalPages);

    if (currentPage > newTotalPages) {
      setCurrentPage(1);
    }
  }, [itemsPerPage, events.length, currentPage]);

  // Пагинация локально - отображаем только нужные мероприятия
  useEffect(() => {
    if (events.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newDisplayedEvents = events.slice(startIndex, endIndex);
      setDisplayedEvents(newDisplayedEvents);
    } else {
      setDisplayedEvents([]);
    }
  }, [events, currentPage, itemsPerPage]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      setError('Необходимо авторизоваться для создания мероприятия');
      return;
    }

    if (!newEvent.title || !newEvent.description || !newEvent.date) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setError(null);
      if (isEditMode && currentEventId) {
        await updateEvent(currentEventId, {
          id: currentEventId,
          title: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
        });
      } else {
        await createEvent({
          title: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
        });
      }

      await fetchEvents();

      setNewEvent({ title: '', description: '', date: '' });
      setIsModalOpen(false);
      setIsEditMode(false);
      setCurrentEventId(null);
    } catch (error: any) {
      console.error(
        `Ошибка при ${isEditMode ? 'обновлении' : 'создании'} мероприятия:`,
        error,
      );
      if (error.response?.status === 401) {
        setError('Необходимо авторизоваться для выполнения этого действия');
      } else {
        setError(
          error.response?.data?.message ||
            `Не удалось ${isEditMode ? 'обновить' : 'создать'} мероприятие`,
        );
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      return;
    }
    try {
      setError(null);
      await deleteEvent(id);
      await fetchEvents();
    } catch (err) {
      console.error('Ошибка при удалении мероприятия:', err);
      setError('Не удалось удалить мероприятие');
    }
  };

  const handleEdit = (event: AppEvent) => {
    setIsEditMode(true);
    setCurrentEventId(event.id);
    try {
      let formattedDate = '';
      if (event.date) {
        const dateObj = new Date(event.date);
        formattedDate = dateObj.toISOString().slice(0, 16);
      }
      setNewEvent({
        title: event.title || '',
        description: event.description || '',
        date: formattedDate,
      });
    } catch (err) {
      console.error('Ошибка при подготовке данных для редактирования:', err);
      setNewEvent({
        title: event.title || '',
        description: event.description || '',
        date: '',
      });
    }
    openModal();
  };

  const openModal = () => {
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
    });
    setIsEditMode(false);
    setCurrentEventId(null);
    setError(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.paginationButton}
      >
        &laquo;
      </button>,
    );
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${styles.paginationButton} ${i === currentPage ? styles.active : ''}`}
        >
          {i}
        </button>,
      );
    }
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.paginationButton}
      >
        &raquo;
      </button>,
    );
    return buttons;
  };

  const formatEventDate = (dateString: string) => {
    try {
      if (!dateString) return 'Дата не указана';
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Некорректная дата';
    }
  };

  const isEventCreator = (event: AppEvent) => {
    return isAuthenticated && String(user?.id) === String(event.createdBy);
  };

  return (
    <div className={styles.eventsPage}>
      <div className={styles.pageHeader}>
        <h1>Мероприятия</h1>
        <div className={styles.headerButtons}>
          {isAuthenticated && (
            <button className={styles.createButton} onClick={openModal}>
              Создать мероприятие
            </button>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.eventsList}>
        {displayedEvents.length === 0 ? (
          <p>Мероприятий не найдено</p>
        ) : (
          displayedEvents.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              {isEventCreator(event) && (
                <div className={styles.eventControls}>
                  <button
                    className={styles.editIcon}
                    onClick={() => handleEdit(event)}
                    aria-label="Редактировать"
                    title="Редактировать"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path
                        fill="currentColor"
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                      />
                    </svg>
                  </button>
                  <button
                    className={styles.deleteIcon}
                    onClick={() => handleDelete(event.id)}
                    aria-label="Удалить"
                    title="Удалить"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path
                        fill="currentColor"
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <h3 className={styles.eventTitle}>
                {event.title || 'Без названия'}
              </h3>
              <div className={styles.eventInfo}>
                <p className={styles.eventDate}>
                  <strong>Дата:</strong> {formatEventDate(event.date)}
                </p>
                <p className={styles.eventDescription}>
                  {event.description || 'Описание отсутствует'}
                </p>
              </div>

              {/* Кнопка с количеством участников */}
              <Button
                variant="outlined"
                onClick={() => openParticipantsModal(event.id, event.title)}
                sx={{ mr: 1 }}
              >
                Участники: {participantsCountMap[event.id] ?? 0}
              </Button>

              {/* Кнопка "Участвовать" */}
              {!isEventCreator(event) && isAuthenticated && (
                <button
                  className={styles.participateButton}
                  onClick={() => handleParticipateClick(event.id)}
                  disabled={loadingParticipation[event.id]}
                >
                  {participationMap[event.id]
                    ? 'Отменить участие'
                    : 'Участвовать'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {events.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationControls}>
            {renderPaginationButtons()}
          </div>
          <div className={styles.itemsPerPage}>
            <DiceRoller
              min={1}
              max={20}
              value={itemsPerPage}
              onRoll={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
              disabled={loading}
            />
          </div>
          <div className={styles.paginationInfo}>
            Страница {currentPage} из {totalPages} (всего {events.length}{' '}
            мероприятий)
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={closeModal}>
              ×
            </button>
            <h2 className={styles.modalTitle}>
              {isEditMode
                ? 'Редактировать мероприятие'
                : 'Создать новое мероприятие'}
            </h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Название *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="description">Описание *</label>
                <textarea
                  id="description"
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="date">Дата проведения *</label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </div>
              <div className={styles.formButtons}>
                <button type="submit" className={styles.submitButton}>
                  {isEditMode ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          {/* Заголовок с названием мероприятия */}
          <Typography
            id="participants-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Участники мероприятия: {modalEventTitle}
          </Typography>

          {Array.isArray(participantsList) ? (
            participantsList.length > 0 ? (
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
            ) : (
              <Typography>Нет участников</Typography>
            )
          ) : (
            <Typography>Данные о участниках недоступны</Typography>
          )}

          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button onClick={closeParticipantsModal}>Закрыть</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Events;
