import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { createEvent, updateEvent } from '../store/slices/eventsSlice';
import { setEventModalOpen } from '../store/slices/uiSlice';
import type { Event, CreateEventRequest } from '../types/event';
import { useEffect } from 'react';

import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface EventFormProps {
  event?: Event;
  onSubmit?: () => void;
}

export const EventForm = ({ event, onSubmit }: EventFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.events);

  const now = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 5);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEventRequest>({
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          date: event.date ? new Date(event.date).toISOString() : '',
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
            date: event.date ? new Date(event.date).toISOString() : '',
          }
        : {
            title: '',
            description: '',
            date: '',
          },
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmitForm)}
        sx={{ mt: 2 }}
      >
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

<Controller
  name="date"
  control={control}
  rules={{
    required: 'Обязательное поле',
    validate: (value) => {
      if (!value) return 'Обязательное поле';
      const selectedDate = new Date(value);
      if (selectedDate < now) return 'Дата должна быть не раньше текущего момента';
      if (selectedDate > maxDate) return 'Дата не может быть позже, чем через 5 лет';
      return true;
    },
  }}
  render={({ field }) => {
    // Преобразуем строку в Date или null
    const value = field.value ? new Date(field.value) : null;

    return (
      <DateTimePicker
        {...field}
        value={value}
        onChange={(date) => {
          field.onChange(date ? date.toISOString() : '');
        }}
        label="Дата"
        minDateTime={now}
        maxDateTime={maxDate}
        slots={{ textField: TextField }}
        slotProps={{
          textField: {
            margin: 'normal',
            fullWidth: true,
            error: !!errors.date,
            helperText: errors.date?.message,
            sx: {
              input: { color: '#000', backgroundColor: '#fff' },
            },
          },
          day: {
            sx: {
              color: '#000',
              backgroundColor: '#fff',
              '&.Mui-selected': {
                backgroundColor: '#1976d2',
                color: '#fff',
              },
              '&:hover': {
                backgroundColor: '#e3f2fd',
              },
            },
          },
          popper: {
            sx: {
              '.MuiPaper-root': {
                backgroundColor: '#fff',
                color: '#000',
              },
            },
          },
        }}
      />
    );
  }}
/>


        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box
          sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}
        >
          <Button
            variant="outlined"
            onClick={() => dispatch(setEventModalOpen(false))}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : event ? (
              'Сохранить'
            ) : (
              'Создать'
            )}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};
