import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, CircularProgress } from '@mui/material';
import FormField from './FormField';
import { FORM_FIELDS } from './constants';

interface FormData {
  name: string;
  email: string;
  phone: string;
  skills: string;
  experience_years: string;
  current_location: string;
  preferred_location: string;
  current_ctc: string;
  expected_ctc: string;
  notice_period: string;
}

interface AddProfileDialogProps {
  open: boolean;
  onClose: () => void;
  formData: FormData;
  errors: {[key: string]: boolean};
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (field: string) => void;
  onSubmit: () => void;
}

const AddProfileDialog: React.FC<AddProfileDialogProps> = ({
  open,
  onClose,
  formData,
  errors,
  submitting,
  onInputChange,
  onBlur,
  onSubmit
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      scroll="body"
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '95vh',
          minHeight: '70vh',
          m: 1
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontSize: '1.25rem', 
        fontWeight: 600,
        py: 2
      }}>
        👤 Add New Candidate
      </DialogTitle>
      <DialogContent sx={{ 
        p: 3, 
        bgcolor: 'background.default',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Grid container spacing={5} sx={{ mt: 0.5, flex: 1 }}>
          {FORM_FIELDS.map(({ field, label, type, xs, sm }) => (
            <FormField
              key={field}
              field={field}
              label={label}
              type={type}
              xs={xs}
              sm={sm}
              value={formData[field as keyof FormData]}
              onChange={onInputChange}
              error={errors[field]}
              onBlur={onBlur}
            />
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ 
        p: 2.5, 
        bgcolor: 'background.paper', 
        gap: 1 
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={onSubmit}
          disabled={submitting}
          sx={{ borderRadius: 2 }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Add Candidate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProfileDialog;