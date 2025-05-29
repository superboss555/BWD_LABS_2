import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Dialog,
  Button,
  Modal,
  List,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { deleteEvent } from '../store/slices/eventsSlice';
import { EventForm } from './EventForm';
import type { Event, Participant } from '../types/event';
import type { User } from '../types/auth';
import {
  addParticipant,
  removeParticipant,
  getEventParticipants,
  getParticipantsCount,
  checkParticipation,
} from '../api/eventParticipantService';
import { formatDate } from '../utils/dateUtils';

interface EventCardProps {
  event: Event;
  currentUser: User | null;
  showActions?: boolean;
  onDeleteSuccess?: () => void;
  onEditSuccess?: () => void;
  onOpenParticipants?: (eventId: string, eventTitle: string) => void;
}

export const EventCard = ({
  event,
  currentUser,
  showActions = false,
  onDeleteSuccess,
  onEditSuccess,
  onOpenParticipants,
}: EventCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(true);

  const isOwner = currentUser?.id?.toString() === event.createdBy?.toString();

  useEffect(() => {
    setMounted(true);

    const fetchParticipationData = async () => {
      if (!mounted) return;

      try {
        const count = await getParticipantsCount(event.id);
        if (mounted) {
          setParticipantsCount(count);
        }

        if (currentUser && mounted) {
          const participation = await checkParticipation(event.id);
          if (mounted) {
            setIsParticipant(participation);
          }
        }
      } catch (error) {
        if (mounted) {
          console.error('Ошибка при загрузке данных об участии:', error);
        }
      }
    };

    fetchParticipationData();

    return () => {
      setMounted(false);
    };
  }, [event.id, currentUser]);

  const handleDelete = async () => {
    if (!mounted) return;

    if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      try {
        await dispatch(deleteEvent(event.id));
        if (onDeleteSuccess && mounted) {
          onDeleteSuccess();
        }
      } catch (error) {
        if (mounted) {
          console.error('Error deleting event:', error);
        }
      }
    }
  };

  const handleEdit = () => {
    if (!mounted) return;
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    if (!mounted) return;
    setIsEditModalOpen(false);
    if (onEditSuccess) {
      onEditSuccess();
    }
  };

  const handleParticipate = async () => {
    if (!mounted) return;

    if (!currentUser) {
      alert('Необходимо авторизоваться для участия в мероприятии');
      return;
    }

    try {
      setLoading(true);
      if (isParticipant) {
        await removeParticipant(event.id);
        if (mounted) {
          setIsParticipant(false);
          setParticipantsCount((prev) => Math.max(prev - 1, 0));
          alert('Вы отменили участие в мероприятии');
        }
      } else {
        await addParticipant(event.id);
        if (mounted) {
          setIsParticipant(true);
          setParticipantsCount((prev) => prev + 1);
          alert('Вы успешно зарегистрировались на мероприятие');
        }
      }
    } catch (error: any) {
      if (mounted) {
        console.error('Ошибка при изменении участия:', error);
        alert(
          error.response?.data?.message ||
            'Произошла ошибка при изменении участия',
        );
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  const showParticipants = async () => {
    if (!mounted) return;

    try {
      setLoading(true);
      const data = await getEventParticipants(event.id);
      if (mounted) {
        setParticipants(data);
        setIsModalVisible(true);
      }
    } catch (error: any) {
      if (mounted) {
        console.error('Ошибка при загрузке списка участников:', error);
        alert(error.message || 'Произошла ошибка при загрузке списка участников');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    if (!mounted) return;
    setIsModalVisible(false);
    setParticipants([]);
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="h2">
            {event.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {event.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Дата: {formatDate(event.date)}
            </Typography>
          </Box>

          <Box
            sx={{
              marginTop: '1rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <Button
              onClick={() => {
                if (onOpenParticipants) {
                  onOpenParticipants(event.id, event.title);
                } else {
                  showParticipants();
                }
              }}
              disabled={loading}
            >
              Участников: {participantsCount}
            </Button>
            {!isOwner && currentUser && (
              <Button
                variant={isParticipant ? 'outlined' : 'contained'}
                color="primary"
                onClick={handleParticipate}
                disabled={loading}
              >
                {isParticipant ? 'Отменить участие' : 'Участвовать'}
              </Button>
            )}
          </Box>

          {showActions && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                size="small"
                onClick={handleEdit}
                aria-label="Редактировать"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleDelete}
                aria-label="Удалить"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <EventForm event={event} onSubmit={handleEditModalClose} />
        </Box>
      </Dialog>

      <Modal
        open={isModalVisible}
        onClose={handleCloseModal}
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
            Список участников
          </Typography>
          <List>
            {participants.length === 0 ? (
              <Typography>Нет участников</Typography>
            ) : (
              participants.map((participant) => (
                <Box key={participant.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    {participant.User?.name || 'Без имени'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {participant.User?.email || 'Без email'}
                  </Typography>
                </Box>
              ))
            )}
          </List>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button onClick={handleCloseModal}>Закрыть</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
