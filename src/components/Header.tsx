import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { alert } from '../utils/alert';
import { apiService } from '../services/apiService';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, username, userData } = useAuth();
  
  const handleAuthClick = async () => {
    if (isAuthenticated) {
      try {
        await apiService.post(process.env.REACT_APP_LOGOUT_ENDPOINT!, {});
      } catch (error) {
        // Continue with logout even if API call fails
      }
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const handleHealthCheck = async () => {
    try {
      await apiService.get(process.env.REACT_APP_HEALTH_CHECK_ENDPOINT!);
      alert.success('API is working!');
    } catch (error) {
      alert.error('API is not reachable');
    }
  };
  
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img 
            src="/images/F1toF12-Logo.png" 
            alt="F1toF12 Logo" 
            style={{ height: 40, marginRight: 16 }}
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            F1toF12
          </Typography>
        </Box>
        <ThemeToggle />
        {isAuthenticated && (
          <Typography 
            variant="body1" 
            sx={{ 
              ml: 2, 
              mr: 1, 
              color: 'white',
              fontWeight: 500,
              backgroundColor: 'rgba(255,255,255,0.1)',
              px: 1,
              borderRadius: 1
            }}
          >
            Hi, {userData?.givenName || username || 'User'}
          </Typography>
        )}
        <Button 
          color="inherit" 
          variant="outlined" 
          sx={{ ml: 2 }}
          onClick={handleHealthCheck}
        >
          HealthCheck
        </Button>
        <Button 
          color="inherit" 
          variant="outlined" 
          sx={{ ml: 2 }}
          onClick={handleAuthClick}
        >
          {isAuthenticated ? 'Logout' : 'Login'}
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;