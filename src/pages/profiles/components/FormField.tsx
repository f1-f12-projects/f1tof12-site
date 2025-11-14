import React from 'react';
import { Grid, TextField, FormControlLabel, Checkbox, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface FormFieldProps {
  field: string;
  label: string;
  type?: string;
  xs: number;
  sm: number;
  value: string | boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
  error?: boolean | string;
  onBlur: (field: string) => void;
}

const modernTextFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      '& fieldset': {
        borderColor: 'primary.main',
        borderWidth: 2
      }
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& fieldset': {
        borderColor: 'primary.main',
        borderWidth: 2,
        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
      }
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: 'primary.main'
    }
  }
};

const FormField = React.memo(({ field, label, type, xs, sm, value, onChange, error, onBlur }: FormFieldProps) => (
  <Grid item xs={xs} sm={sm}>
    {type === 'select' ? (
      <FormControl fullWidth size="medium">
        <InputLabel sx={{ fontWeight: 500 }}>{label}</InputLabel>
        <Select
          value={value === true ? 'Yes' : 'No'}
          label={label}
          name={field}
          onChange={onChange}
          onBlur={() => onBlur(field)}
          sx={{
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            },
            '&.Mui-focused': {
              backgroundColor: '#fff'
            }
          }}
        >
          <MenuItem value="No">No</MenuItem>
          <MenuItem value="Yes">Yes</MenuItem>
        </Select>
      </FormControl>
    ) : type === 'checkbox' ? (
      <Box sx={{ 
        p: 2, 
        borderRadius: 3, 
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'primary.main'
        }
      }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(value)}
              onChange={onChange}
              name={field}
              onBlur={() => onBlur(field)}
              sx={{
                '&.Mui-checked': {
                  color: 'primary.main'
                }
              }}
            />
          }
          label={
            <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {label}
            </Typography>
          }
          sx={{ m: 0 }}
        />
      </Box>
    ) : (
      <TextField 
        fullWidth 
        label={label}
        variant="outlined"
        size="medium"
        type={type || 'text'} 
        value={value} 
        name={field}
        onChange={onChange}
        onBlur={() => onBlur(field)}
        required
        error={Boolean(error)}
        helperText={error === true ? 'This field is required' : (typeof error === 'string' ? error : '')}
        sx={modernTextFieldSx}
      />
    )}
  </Grid>
));

export default FormField;