import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Grid, Alert } from '@mui/material';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Company Registration:', formData);
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
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                error={!!errors.companyName}
                helperText={errors.companyName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SPOC Name"
                name="spocName"
                value={formData.spocName}
                onChange={handleChange}
                error={!!errors.spocName}
                helperText={errors.spocName}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Address"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                multiline
                rows={3}
                error={!!errors.companyAddress}
                helperText={errors.companyAddress}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email ID"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={handleChange}
                error={!!errors.emailId}
                helperText={errors.emailId}
              />
            </Grid>
            
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