import React from 'react';
import { Alert, Snackbar, AlertColor } from '@mui/material';

interface AlertState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

let setAlertState: React.Dispatch<React.SetStateAction<AlertState>> | null = null;

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = React.useState<AlertState>({
    open: false,
    message: '',
    severity: 'info'
  });

  React.useEffect(() => {
    setAlertState = setAlert;
  }, []);

  const handleClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      {children}
      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{
          vertical: alert.severity === 'error' || alert.severity === 'warning' ? 'top' : 'bottom',
          horizontal: alert.severity === 'error' || alert.severity === 'warning' ? 'center' : 'left'
        }}
      >
        <Alert
          onClose={handleClose}
          severity={alert.severity}
          variant="filled"
          sx={{ minWidth: 300 }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export const showAlert = (message: string, severity: AlertColor = 'info') => {
  if (setAlertState) {
    setAlertState({ open: true, message, severity });
  }
};

export const alert = {
  success: (message: string) => showAlert(message, 'success'),
  error: (message: string) => showAlert(message, 'error'),
  warning: (message: string) => showAlert(message, 'warning'),
  info: (message: string) => showAlert(message, 'info')
};