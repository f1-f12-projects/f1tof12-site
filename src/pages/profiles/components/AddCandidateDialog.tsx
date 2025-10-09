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

interface AddCandidateDialogProps {
  open: boolean;
  onClose: () => void;
  formData: FormData;
  errors: {[key: string]: boolean};
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (field: string) => void;
  onSubmit: () => void;
}

const AddCandidateDialog: React.FC<AddCandidateDialogProps> = ({
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
          maxHeight: '90vh',
          m: 1
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        fontSize: '1.25rem', 
        fontWeight: 600,
        py: 2
      }}>
        👤 Add New Candidate
      </DialogTitle>
      <DialogContent sx={{ p: 3, backgroundColor: '#fafafa' }}>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
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
      <DialogActions sx={{ p: 2.5, backgroundColor: '#f5f5f5', gap: 1 }}>
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
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
            }
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Add Candidate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCandidateDialog;