import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Paper, Typography } from '@mui/material';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { handleApiResponse } from '../../utils/apiHandler';
import { alert } from '../../utils/alert';

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState({
    given_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    temporary_password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called');
    e.preventDefault();

    console.log('Form data before validation:', formData);
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.given_name.trim()) newErrors.given_name = 'Given name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.temporary_password.trim()) newErrors.temporary_password = 'Password is required';
    else if (formData.temporary_password.length < 6) newErrors.temporary_password = 'Password must be at least 6 characters';
    
    console.log ('Validation errors:', newErrors);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      alert.error('All fields are required');
      return;
    }
    
    await handleApiResponse(
      () => userService.createUser(formData),
      () => navigate('/admin/users')
    );
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const fields = [
    { name: 'given_name', label: 'Given Name', type: 'text' },
    { name: 'last_name', label: 'Last Name', type: 'text' },
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'phone_number', label: 'Phone Number', type: 'text' },
    { name: 'temporary_password', label: 'Temporary Password', type: 'password' }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Create User</Typography>
        <form onSubmit={handleSubmit}>
          {fields.map(({ name, label, type }, index) => (
            <TextField
              key={name}
              name={name}
              label={label}
              type={type}
              value={formData[name as keyof typeof formData]}
              onChange={handleChange}
              fullWidth
              error={!!errors[name]}
              helperText={errors[name]}
              sx={{ 
                mb: index === fields.length - 1 ? 3 : 2,
                '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'red'
                }
              }}
            />
          ))}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              type="submit" 
              variant="contained"
              onClick={() => console.log('Submit button clicked')}
            >
              Create User
            </Button>
            <Button onClick={() => navigate('/admin/users')}>Cancel</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateUser;