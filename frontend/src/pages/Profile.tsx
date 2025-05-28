import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { fetchUserEvents } from '../store/slices/eventsSlice';
import { EventCard } from '../components/EventCard';
import type { Event } from '../types/event';

export const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { userEvents, loading, error } = useSelector((state: RootState) => state.events);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserEvents());
    }
  }, [dispatch, user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{ width: 100, height: 100, mr: 3 }}
                alt={user.name}
              >
                {user.name[0]}
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {user.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Мои мероприятия
      </Typography>

      {loading ? (
        <Typography>Загрузка...</Typography>
      ) : Array.isArray(userEvents) && userEvents.length > 0 ? (
        <Grid container spacing={3}>
          {userEvents.map((event: Event) => (
            <Box
              key={event.id}
              sx={{
                width: {
                  xs: '100%',
                  sm: '50%',
                  md: '33.33%'
                },
                p: 1.5
              }}
            >
              <EventCard event={event} showActions />
            </Box>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary">
          У вас пока нет созданных мероприятий
        </Typography>
      )}
    </Container>
  );
}; 