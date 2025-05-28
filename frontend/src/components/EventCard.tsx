import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Dialog,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { deleteEvent } from '../store/slices/eventsSlice';
import { EventForm } from './EventForm';
import type { Event } from '../types/event';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onDeleteSuccess?: () => void;
  onEditSuccess?: () => void;
}

export const EventCard = ({ event, showActions = false, onDeleteSuccess, onEditSuccess }: EventCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      try {
        await dispatch(deleteEvent(event.id));
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    if (onEditSuccess) {
      onEditSuccess();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          {showActions && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton size="small" onClick={handleEdit} aria-label="Редактировать">
                <EditIcon />
              </IconButton>
              <IconButton size="small" onClick={handleDelete} aria-label="Удалить">
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
          <EventForm
            event={event}
            onSubmit={handleEditModalClose}
          />
        </Box>
      </Dialog>
    </>
  );
};
