import React from 'react';
import { Grid, TextField } from '@mui/material';
import { textFieldSx } from './constants';

interface FormFieldProps {
  field: string;
  label: string;
  type?: string;
  xs: number;
  sm: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  onBlur: (field: string) => void;
}

const FormField = React.memo(({ field, label, type, xs, sm, value, onChange, error, onBlur }: FormFieldProps) => (
  <Grid item xs={xs} sm={sm}>
    <TextField 
      fullWidth 
      label={label}
      variant="outlined"
      size="small"
      type={type || 'text'} 
      value={value} 
      name={field}
      onChange={onChange}
      onBlur={() => onBlur(field)}
      required
      error={error}
      helperText={error ? 'This field is required' : ''}
      sx={textFieldSx}
    />
  </Grid>
));

export default FormField;