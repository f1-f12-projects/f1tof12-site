import React from 'react';
import { Alert, Snackbar, AlertColor } from '@mui/material';

interface AlertState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface AlertContextType {
  showAlert: (message: string, severity?: AlertColor) => void;
}

const AlertContext = React.createContext<AlertContextType | null>(null);

// Global alert instance
let globalShowAlert: ((message: string, severity?: AlertColor) => void) | null = null;

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = React.useState<AlertState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showAlert = React.useCallback((message: string, severity: AlertColor = 'info') => {
    setAlert({ open: true, message, severity });
  }, []);

  // Set global reference
  React.useEffect(() => {
    globalShowAlert = showAlert;
    return () => {
      globalShowAlert = null;
    };
  }, [showAlert]);

  const handleClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
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
    </AlertContext.Provider>
  );
};

const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const showAlert = (message: string, severity: AlertColor = 'info') => {
  if (globalShowAlert) {
    globalShowAlert(message, severity);
  } else {
    console.warn('AlertProvider not found. Make sure to wrap your app with AlertProvider.');
  }
};

export const alert = {
  success: (message: string) => showAlert(message, 'success'),
  error: (message: string) => showAlert(message, 'error'),
  warning: (message: string) => showAlert(message, 'warning'),
  info: (message: string) => showAlert(message, 'info')
};

export { useAlert };