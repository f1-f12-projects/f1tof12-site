import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

let setConfirmState: React.Dispatch<React.SetStateAction<ConfirmState>> | null = null;

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [confirm, setConfirm] = React.useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  React.useEffect(() => {
    setConfirmState = setConfirm;
  }, []);

  const handleConfirm = () => {
    confirm.onConfirm();
    setConfirm(prev => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    confirm.onCancel();
    setConfirm(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      {children}
      <Dialog
        open={confirm.open}
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {confirm.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {confirm.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCancel} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const showConfirm = (
  message: string, 
  title: string = 'Confirm Action'
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (setConfirmState) {
      setConfirmState({
        open: true,
        title,
        message,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    } else {
      resolve(false);
    }
  });
};