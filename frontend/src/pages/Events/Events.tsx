import { useEffect, useState, useCallback } from 'react';
import { getAllEvents, createEvent, deleteEvent, updateEvent } from '../../api/eventService';
import { getFromStorage, STORAGE_KEYS } from '../../utils/localStorage';
import type { Event as AppEvent, CreateEventRequest, UpdateEventRequest } from '../../types/event';
import type { User } from '../../types/auth';
import styles from './Events.module.scss';
import DiceRoller from '../../components/DiceRoller';

const Events = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<AppEvent[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  
  // Состояние для модального окна и формы
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<CreateEventRequest>({
    title: '',
    description: '',
    date: '',
    location: ''
  });

  // Обновляю проверку авторизации вначале компонента
  const isAuthenticated = !!user && !!user.id;

  // Выносим функцию обновления пользователя в useCallback
  const updateUserState = useCallback(() => {
    try {
      // Сначала проверяем наличие данных в localStorage
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

  useEffect(() => {
    // Получаем данные пользователя из localStorage при монтировании компонента
    updateUserState();
    
    fetchEvents();

    // Обработчик для событий авторизации
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

  // Эффект для пагинации
  useEffect(() => {
    console.log('=== Pagination Debug ===');
    console.log('Current itemsPerPage:', itemsPerPage);
    console.log('Current page:', currentPage);
    console.log('Total events:', events.length);
    
    if (events.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      console.log('Start index:', startIndex);
      console.log('End index:', endIndex);
      console.log('Slice range:', `${startIndex}:${endIndex}`);
      
      const newDisplayedEvents = events.slice(startIndex, endIndex);
      console.log('New displayed events length:', newDisplayedEvents.length);
      console.log('New displayed events:', newDisplayedEvents);
      
      setTotalPages(Math.ceil(events.length / itemsPerPage));
      setDisplayedEvents(newDisplayedEvents);
    } else {
      setDisplayedEvents([]);
      setTotalPages(1);
    }
  }, [events, currentPage, itemsPerPage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getAllEvents();
      console.log('=== Fetched Events Debug ===');
      console.log('Total events loaded:', eventsData?.length || 0);
      console.log('Events data:', eventsData);
      setEvents(eventsData || []);
      setError(null);
    } catch (err) {
      console.error('Ошибка при получении мероприятий:', err);
      setError('Не удалось загрузить мероприятия');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.location) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    try {
      setError(null);
      if (isEditMode && currentEventId) {
        // Обновляем существующее мероприятие
        await updateEvent({ 
          id: currentEventId,
          ...newEvent 
        });
      } else {
        // Создаем новое мероприятие
        await createEvent(newEvent);
      }
      
      // Сбрасываем форму
      setNewEvent({
        title: '',
        description: '',
        date: '',
        location: ''
      });
      
      // Закрываем модальное окно и сбрасываем режим редактирования
      setIsModalOpen(false);
      setIsEditMode(false);
      setCurrentEventId(null);
      
      // Обновляем список мероприятий
      fetchEvents();
    } catch (err) {
      console.error(`Ошибка при ${isEditMode ? 'обновлении' : 'создании'} мероприятия:`, err);
      setError(`Не удалось ${isEditMode ? 'обновить' : 'создать'} мероприятие`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await deleteEvent(id);
      // Обновляем список мероприятий
      fetchEvents();
    } catch (err) {
      console.error('Ошибка при удалении мероприятия:', err);
      setError('Не удалось удалить мероприятие');
    }
  };

  // Обработчик для редактирования мероприятия
  const handleEdit = (event: AppEvent) => {
    setIsEditMode(true);
    setCurrentEventId(event.id);
    
    try {
      // Форматируем дату в формат datetime-local
      let formattedDate = '';
      if (event.date) {
        const dateObj = new Date(event.date);
        formattedDate = dateObj.toISOString().slice(0, 16);
      }
      
      setNewEvent({
        title: event.title || '',
        description: event.description || '',
        date: formattedDate,
        location: event.location || '',
        imageUrl: event.imageUrl
      });
    } catch (err) {
      console.error('Ошибка при подготовке данных для редактирования:', err);
      setNewEvent({
        title: event.title || '',
        description: event.description || '',
        date: '',
        location: event.location || '',
        imageUrl: event.imageUrl
      });
    }
    
    openModal();
  };

  // Обработчики для модального окна
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
      location: ''
    });
    setIsEditMode(false);
    setCurrentEventId(null);
    setError(null);
  };

  // Функции для пагинации
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setItemsPerPage(value);
    setCurrentPage(1); // Сбрасываем страницу на первую при изменении количества элементов
  };

  // Функция для создания списка номеров страниц
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Добавляем кнопку "Предыдущая"
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.paginationButton}
      >
        &laquo;
      </button>
    );
    
    // Определяем, сколько кнопок показывать (макс. 5)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Корректируем startPage, если endPage достиг предела
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // Добавляем кнопки с номерами страниц
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${styles.paginationButton} ${i === currentPage ? styles.active : ''}`}
        >
          {i}
        </button>
      );
    }
    
    // Добавляем кнопку "Следующая"
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.paginationButton}
      >
        &raquo;
      </button>
    );
    
    return buttons;
  };

  // Функция для безопасного форматирования даты
  const formatEventDate = (dateString: string) => {
    try {
      if (!dateString) return "Дата не указана";
      
      return new Date(dateString).toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return "Некорректная дата";
    }
  };

  // Проверка, является ли пользователь создателем события
  const isEventCreator = (event: AppEvent) => {
    return isAuthenticated && user?.id === event.organizerId;
  };

  // Добавляем эффект для отслеживания изменений itemsPerPage
  useEffect(() => {
    console.log('=== Events ItemsPerPage Changed ===');
    console.log('New itemsPerPage value:', itemsPerPage);
  }, [itemsPerPage]);

  if (loading) {
    return <div className={styles.loading}>Загрузка мероприятий...</div>;
  }

  return (
    <div className={styles.eventsPage}>
      <div className={styles.pageHeader}>
        <h1>Мероприятия</h1>
        <div className={styles.headerButtons}>
          {isAuthenticated && (
            <button
              className={styles.createButton}
              onClick={openModal}
            >
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
          displayedEvents.map(event => (
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
                      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </button>
                  <button 
                    className={styles.deleteIcon}
                    onClick={() => handleDelete(event.id)}
                    aria-label="Удалить"
                    title="Удалить"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              )}
              <h3 className={styles.eventTitle}>{event.title || "Без названия"}</h3>
              <div className={styles.eventInfo}>
                <p className={styles.eventDate}>
                  <strong>Дата:</strong> {formatEventDate(event.date)}
                </p>
                <p className={styles.eventDescription}>{event.description || "Описание отсутствует"}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Элементы пагинации */}
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
                console.log('=== Events DiceRoll Handler ===');
                console.log('New dice value:', value);
                console.log('Current itemsPerPage before update:', itemsPerPage);
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
              disabled={loading}
            />
          </div>
          <div className={styles.paginationInfo}>
            Страница {currentPage} из {totalPages} (всего {events.length} мероприятий)
          </div>
        </div>
      )}

      {/* Модальное окно для создания/редактирования мероприятия */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>×</button>
            <h2 className={styles.modalTitle}>
              {isEditMode ? 'Редактировать мероприятие' : 'Создать новое мероприятие'}
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
              
              <div className={styles.formGroup}>
                <label htmlFor="location">Место проведения *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newEvent.location}
                  onChange={handleInputChange}
                  autoComplete="address-level2"
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
    </div>
  );
};

export default Events;