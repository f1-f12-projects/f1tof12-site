import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Card, Typography, IconButton, InputAdornment, FormControl, InputLabel, Select, MenuItem, Container, Stack, Divider, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { handleApiResponse } from '../../utils/apiHandler';
import { alert } from '../../utils/alert';

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState({
    given_name: '',
    family_name: '',
    username: '',
    email: '',
    phone_number: '',
    temporary_password: '',
    role: 'recruiter'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.given_name.trim()) newErrors.given_name = 'Given name is required';
    if (!formData.family_name.trim()) newErrors.family_name = 'Family name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.temporary_password.trim()) newErrors.temporary_password = 'Password is required';
    else if (formData.temporary_password.length < 6) newErrors.temporary_password = 'Password must be at least 6 characters';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      alert.error('All fields are required');
      return;
    }
    
    setLoading(true);
    try {
      await userService.createUser({ ...formData, role: formData.role.toLowerCase() });
      alert.success('User created successfully');
      navigate('/admin/users');
    } catch (error) {
      alert.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const fields = [
    { name: 'given_name', label: 'Given Name', type: 'text' },
    { name: 'family_name', label: 'Family Name', type: 'text' },
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'phone_number', label: 'Phone Number', type: 'text' },
    { name: 'temporary_password', label: 'Temporary Password', type: 'password' }
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <PersonAdd color="primary" fontSize="large" sx={{ mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Create New User
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new user to the organization
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="given_name"
                label="Given Name"
                value={formData.given_name}
                onChange={handleChange}
                error={!!errors.given_name}
                helperText={errors.given_name}
                variant="outlined"
                fullWidth
              />
              <TextField
                name="family_name"
                label="Family Name"
                value={formData.family_name}
                onChange={handleChange}
                error={!!errors.family_name}
                helperText={errors.family_name}
                variant="outlined"
                fullWidth
              />
            </Box>

            <TextField
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              fullWidth
              variant="outlined"
            />

            <TextField
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              variant="outlined"
            />

            <TextField
              name="phone_number"
              label="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
              error={!!errors.phone_number}
              helperText={errors.phone_number}
              fullWidth
              variant="outlined"
            />

            <TextField
              name="temporary_password"
              label="Temporary Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.temporary_password}
              onChange={handleChange}
              error={!!errors.temporary_password}
              helperText={errors.temporary_password}
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <FormControl fullWidth error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, role: e.target.value }));
                  if (errors.role) setErrors(prev => ({ ...prev, role: '' }));
                }}
                label="Role"
              >
                <MenuItem value="recruiter">Recruiter</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
                <MenuItem value="finance">Finance</MenuItem>
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.role}
                </Typography>
              )}
            </FormControl>
          </Stack>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button 
              type="submit" 
              variant="contained"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
            <Button 
              onClick={() => navigate('/admin/users')}
              variant="outlined"
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Card>
    </Container>
  );
};

export default CreateUser;