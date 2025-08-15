import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { alert } from '../utils/alert';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, username } = useAuth();
  
  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const handleHealthCheck = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/health`);
      if (response.ok) {
        alert.success('API is working!');
      } else {
        alert.error('API is not responding properly');
      }
    } catch (error) {
      alert.error('API is not reachable');
    }
  };
  
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
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