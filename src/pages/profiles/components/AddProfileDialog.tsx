import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, CircularProgress, Typography, Box } from '@mui/material';
import FormField from './FormField';
import FileUploadField from './FileUploadField';
import { FORM_FIELD_GROUPS } from './constants';

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
  highest_education: string;
  current_employer: string;
  offer_in_hand: boolean;
  profile_file: File | null;
}

interface AddProfileDialogProps {
  open: boolean;
  onClose: () => void;
  formData: FormData;
  errors: {[key: string]: boolean | string};
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (file: File | null) => void;
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
  onFileChange,
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
          borderRadius: 4,
          maxHeight: '95vh',
          minHeight: '70vh',
          m: 1,
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.5rem', 
        fontWeight: 700,
        py: 3,
        textAlign: 'center'
      }}>
        ✨ Add New Candidate
      </DialogTitle>
      <DialogContent sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        maxHeight: 'calc(95vh - 200px)'
      }}>
        <Box sx={{ mt: 0 }}>
          {FORM_FIELD_GROUPS.map((group, groupIndex) => (
            <Box key={group.title} sx={{ mb: 2.5 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 1.5, 
                  fontWeight: 600, 
                  color: 'rgba(0, 0, 0, 0.8)',
                  borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
                  pb: 0.5
                }}
              >
                {group.title}
              </Typography>
              <Grid container spacing={2}>
                {group.fields.map(({ field, label, type, xs, sm }) => (
                  type === 'file' ? (
                    <FileUploadField
                      key={field}
                      xs={xs}
                      sm={sm}
                      file={formData.profile_file}
                      onChange={onFileChange}
                      error={typeof errors[field] === 'string' ? errors[field] as string : undefined}
                    />
                  ) : (
                    <FormField
                      key={field}
                      field={field}
                      label={label}
                      type={type}
                      xs={xs}
                      sm={sm}
                      value={formData[field as keyof Omit<FormData, 'profile_file'>]}
                      onChange={onInputChange}
                      error={errors[field]}
                      onBlur={onBlur}
                    />
                  )
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        gap: 2,
        justifyContent: 'center'
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 3,
            px: 4,
            py: 1.5,
            borderColor: 'white',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={onSubmit}
          disabled={submitting}
          sx={{ 
            borderRadius: 3,
            px: 4,
            py: 1.5,
            backgroundColor: 'white',
            color: 'primary.main',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              backgroundColor: '#f8f9fa',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
            }
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : '🚀 Add Candidate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProfileDialog;