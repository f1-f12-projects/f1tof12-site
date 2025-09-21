import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { alert } from '../utils/alert';
import { handleApiResponse } from '../utils/apiHandler';
import { roleHelper } from '../utils/roleHelper';

const PasswordField = ({ label, value, onChange, show, onToggle, error, helperText }: any) => (
  <TextField
    fullWidth
    label={label}
    type={show ? 'text' : 'password'}
    value={value}
    onChange={onChange}
    error={!!error}
    helperText={helperText}
    required
    sx={{ mb: label === 'Confirm Password' ? 3 : 2 }}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={onToggle} edge="end">
            {show ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      )
    }}
  />
);

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [showPasswords, setShowPasswords] = useState({ login: false, new: false, confirm: false });
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  const [passwordData, setPasswordData] = useState({ new: '', confirm: '', error: '' });
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
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
      setLoading(true);
      await handleApiResponse(
        () => authService.login({
          username: formData.username,
          password: formData.password
        }),
        (data: any) => {
          if (!isMounted.current) return;
          if (data.access_token) {
            login(formData.username, data.access_token, data.role);
            navigate(roleHelper.getDefaultRoute(data.role));
          } else {
            setErrors({ username: '', password: 'Invalid credentials' });
          }
          setLoading(false);
        },
        (error: any) => {
          if (!isMounted.current) return;
          if (error.detail?.error === 'PASSWORD_CHANGE_REQUIRED') {
            setPasswordChangeRequired(true);
            alert.info('Password change required. Please set a new password.');
          } else {
            alert.error('Login failed. Please check your credentials.');
          }
          setLoading(false);
        }
      );
    }
  };

  const updatePasswordData = (field: 'new' | 'confirm') => (e: React.ChangeEvent<HTMLInputElement>) => 
    setPasswordData(prev => ({ ...prev, [field]: e.target.value, error: '' }));

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => () => 
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setPasswordData(prev => ({ ...prev, error: 'Passwords do not match' }));
      return;
    }
    setChangingPassword(true);
    await handleApiResponse(
      () => authService.changePassword({
        username: formData.username,
        temporary_password: formData.password,
        new_password: passwordData.new
      }),
      () => {
        if (!isMounted.current) return;
        setPasswordChangeRequired(false);
        setFormData({ username: '', password: '' });
        setPasswordData({ new: '', confirm: '', error: '' });
        setChangingPassword(false);
      },
      () => {
        if (!isMounted.current) return;
        setChangingPassword(false);
      }
    );
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {passwordChangeRequired ? 'Change Password' : 'Login'}
        </Typography>
        
        {passwordChangeRequired ? (
          <Box component="form" onSubmit={handlePasswordChange} noValidate sx={{ mt: 3 }}>
            {[
              { label: 'New Password', field: 'new' as const, showKey: 'new' as const },
              { label: 'Confirm Password', field: 'confirm' as const, showKey: 'confirm' as const }
            ].map(({ label, field, showKey }) => (
              <PasswordField
                key={field}
                label={label}
                value={passwordData[field]}
                onChange={updatePasswordData(field)}
                show={showPasswords[showKey]}
                onToggle={togglePasswordVisibility(showKey)}
                error={field === 'confirm' ? passwordData.error : undefined}
                helperText={field === 'confirm' ? passwordData.error : undefined}
              />
            ))}
            <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }} disabled={changingPassword}>
              {changingPassword ? <CircularProgress size={24} color="inherit" /> : 'Change Password'}
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
              type={showPasswords.login ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPasswords(prev => ({ ...prev, login: !prev.login }))}
                      edge="end"
                    >
                      {showPasswords.login ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Login;