import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Grid, Alert } from '@mui/material';
import { companyService } from '../../services/companyService';

const RegisterCompany: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    spocName: '',
    companyAddress: '',
    emailId: ''
  });
  
  const [errors, setErrors] = useState({
    companyName: '',
    spocName: '',
    companyAddress: '',
    emailId: ''
  });
  
  const [success, setSuccess] = useState(false);
  const [errorAlert, setErrorAlert] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setErrorAlert('');
  };

  const validateForm = () => {
    const newErrors = { companyName: '', spocName: '', companyAddress: '', emailId: '' };
    
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.spocName.trim()) newErrors.spocName = 'SPOC name is required';
    if (!formData.companyAddress.trim()) newErrors.companyAddress = 'Company address is required';
    if (!formData.emailId.trim()) {
      newErrors.emailId = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      newErrors.emailId = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const registerCompany = async () => {
    try {
      const companyData = {
        name: formData.companyName,
        spoc: formData.spocName,
        email_id: formData.emailId,
        status: 'active' as const
      };
      await companyService.registerCompany(companyData);
      console.log('Company registered successfully');
    } catch (error: any) {
      console.error('Error registering company:', error);
      if (error.message?.includes('409')) {
        setErrorAlert('Company already exists with this name or email.');
      } else {
        setErrors({ ...errors, emailId: 'Failed to register company. Please try again.' });
        throw error;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await registerCompany();
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 600 }}>
          Register Company
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Company registered successfully! Redirecting to home...
          </Alert>
        )}
        
        {errorAlert && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorAlert}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {[
              { name: 'companyName', label: 'Company Name', xs: 12, sm: 6 },
              { name: 'spocName', label: 'SPOC Name', xs: 12, sm: 6 },
              { name: 'companyAddress', label: 'Company Address', xs: 12, multiline: true, rows: 3 },
              { name: 'emailId', label: 'Email ID', xs: 12, type: 'email' }
            ].map(field => (
              <Grid item xs={field.xs} sm={field.sm} key={field.name}>
                <TextField
                  fullWidth
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  error={!!errors[field.name as keyof typeof errors]}
                  helperText={errors[field.name as keyof typeof errors]}
                  multiline={field.multiline}
                  rows={field.rows}
                />
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={success}
                sx={{ 
                  mt: 2, 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                {success ? 'Registered Successfully!' : 'Register Company'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterCompany;