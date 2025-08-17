import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Grid } from '@mui/material';
import { companyService } from '../../services/companyService';
import { alert } from '../../utils/alert';
import { useAuth } from '../../context/AuthContext';

const RegisterCompany: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
  
  useEffect(() => {
    if (!isAuthenticated) {
      alert.error('Please login to access this page');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
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

  const registerCompany = async () => {
    try {
      const companyData = {
        name: formData.companyName,
        spoc: formData.spocName,
        email_id: formData.emailId,
        status: 'active' as const
      };
      await companyService.registerCompany(companyData);
      alert.success('Company registered successfully!');
    } catch (error: any) {
      console.error('Error registering company:', error);
      if (error.message?.includes('409')) {
        alert.error('Company already exists with this name or email.');
      } else {
        alert.error('Failed to register company. Please try again.');
        throw error;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await registerCompany();
        setTimeout(() => navigate('/'), 2000);
      } catch (error) {
        // Error already handled in registerCompany
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 600 }}>
          Register Company
        </Typography>
        

        
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

                sx={{ 
                  mt: 2, 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                Register Company
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterCompany;