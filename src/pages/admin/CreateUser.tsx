import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Paper, Typography } from '@mui/material';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { alert } from '../../utils/alert';

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    temporary_password: ''
  });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('Form data:', formData);
    try {
      console.log('Creating user with data:', formData);
      const response = await userService.createUser(formData);
      console.log('Response:', response);
      alert.success(response.message);
      navigate('/admin/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert.error(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Create User</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            name="username"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            name="phone_number"
            label="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            name="temporary_password"
            label="Temporary Password"
            type="password"
            value={formData.temporary_password}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained">Create User</Button>
            <Button onClick={() => navigate('/admin/users')}>Cancel</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateUser;