import { Alert, Snackbar } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { clearNotification } from '../store/slices/uiSlice';

export const ErrorNotification = () => {
  const dispatch = useDispatch();
  const notification = useSelector((state: RootState) => state.ui.notification);

  const handleClose = () => {
    dispatch(clearNotification());
  };

  return (
    <Snackbar
      open={!!notification.message && !!notification.type}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.type || 'info'}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
}; 