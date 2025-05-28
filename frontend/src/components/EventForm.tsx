import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { createEvent, updateEvent } from '../store/slices/eventsSlice';
import { setEventModalOpen } from '../store/slices/uiSlice';
import type { Event, CreateEventRequest } from '../types/event';
import { useEffect } from 'react';

interface EventFormProps {
  event?: Event;
  onSubmit?: () => void;
}

export const EventForm = ({ event, onSubmit }: EventFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.events);

  // Рассчитываем минимальную и максимальную дату для валидации и ограничения выбора
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  const maxDateObj = new Date(now);
  maxDateObj.setFullYear(maxDateObj.getFullYear() + 5);
  const maxDateTime = maxDateObj.toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEventRequest>({
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        }
      : {
          title: '',
          description: '',
          date: '',
        },
  });

  useEffect(() => {
    reset(
      event
        ? {
            title: event.title,
            description: event.description,
            date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
          }
        : {
            title: '',
            description: '',
            date: '',
          }
    );
  }, [event, reset]);

  const onSubmitForm = async (data: CreateEventRequest) => {
    try {
      if (event?.id) {
        await dispatch(updateEvent({ id: event.id, eventData: data })).unwrap();
      } else {
        await dispatch(createEvent(data)).unwrap();
      }
      dispatch(setEventModalOpen(false));
      onSubmit?.();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitForm)} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {event ? 'Редактировать мероприятие' : 'Создать мероприятие'}
      </Typography>

      <TextField
        fullWidth
        label="Название"
        margin="normal"
        {...register('title', {
          required: 'Обязательное поле',
          minLength: { value: 3, message: 'Минимум 3 символа' },
          maxLength: { value: 100, message: 'Максимум 100 символов' },
        })}
        error={!!errors.title}
        helperText={errors.title?.message}
      />

      <TextField
        fullWidth
        label="Описание"
        multiline
        rows={4}
        margin="normal"
        {...register('description', {
          required: 'Обязательное поле',
          minLength: { value: 10, message: 'Минимум 10 символов' },
          maxLength: { value: 1000, message: 'Максимум 1000 символов' },
        })}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <TextField
        fullWidth
        label="Дата"
        type="datetime-local"
        margin="normal"
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: minDateTime, max: maxDateTime }}
        {...register('date', {
          required: 'Обязательное поле',
          validate: (value) => {
            if (!value) return 'Обязательное поле';
            const eventDate = new Date(value);
            const nowDate = new Date();
            const maxDateLimit = new Date(maxDateTime);

            if (eventDate < nowDate) {
              return 'Дата должна быть не раньше текущего момента';
            }
            if (eventDate > maxDateLimit) {
              return 'Дата не может быть позже, чем через 5 лет';
            }
            return true;
          },
        })}
        error={!!errors.date}
        helperText={errors.date?.message}
      />

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={() => dispatch(setEventModalOpen(false))} disabled={loading}>
          Отмена
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : event ? 'Сохранить' : 'Создать'}
        </Button>
      </Box>
    </Box>
  );
};
