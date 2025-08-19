import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { alert } from '../utils/alert';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { username: '', password: '' };
    
    if (!formData.username.trim()) {
      newErrors.username = 'Please enter username';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Please enter password';
    }
    
    setErrors(newErrors);
    
    if (!newErrors.username && !newErrors.password) {
      try {
        const data = await apiService.post(process.env.REACT_APP_LOGIN_ENDPOINT!, {
          username: formData.username,
          password: formData.password
        }) as { access_token: string; token_type: string; status_code: number };
        
        if (data.access_token) {
          login(formData.username, data.access_token);
          navigate('/');
        } else {
          setErrors({ username: '', password: 'Invalid credentials' });
        }
      } catch (error: any) {
        console.error('Login error:', error);
        console.log('Error data:', error.data);
        if (error.status === 400 && error.data?.detail?.includes('Password change required')) {
          setPasswordChangeRequired(true);
          setErrors({ username: '', password: '' });
        } else {
          setErrors({ username: '', password: 'Login failed' });
        }
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    try {
      await apiService.post(process.env.REACT_APP_USER_CHANGE_PASSWORD_ENDPOINT!, {
        username: formData.username,
        temporary_password: formData.password,
        new_password: newPassword
      });
      alert.success('Password changed successfully. Please login!');
      setPasswordChangeRequired(false);
      setFormData({ username: '', password: '' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      alert.error(error.data?.detail || 'Password change failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {passwordChangeRequired ? 'Change Password' : 'Login'}
        </Typography>
        
        {passwordChangeRequired ? (
          <Box component="form" onSubmit={handlePasswordChange} noValidate sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={!!passwordError}
              helperText={passwordError}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 2 }}
            >
              Change Password
            </Button>
          </Box>
        ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            sx={{ mb: 3 }}
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
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Login;