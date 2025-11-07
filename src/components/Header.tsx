import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import { AccountCircle, Person, EventNote, Logout } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { alert } from '../utils/alert';
import { userService } from '../services/userService';
import { apiService } from '../services/apiService';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, username, authToken } = useAuth();
  const [givenName, setGivenName] = useState<String>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleAuthClick = async () => {
    if (isAuthenticated) {
      setIsLoggingOut(true);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogoutFromMenu = async () => {
    handleMenuClose();
    await handleAuthClick();
  };

  const getInitials = () => {
    if (givenName) {
      return givenName.charAt(0).toUpperCase();
    }
    return username?.charAt(0).toUpperCase() || 'U';
  };

  // Add useEffect to get Given name
  useEffect(() => {
    const getGivenName = async () => {
      if (isAuthenticated && username && authToken) {
        // Small delay to ensure token is saved to localStorage
        setTimeout(async () => {
          const userDetails = await userService.getUserDetails(username);
          setGivenName(userDetails?.given_name || undefined);
        }, 100);
      }
    };
    getGivenName();
  }, [isAuthenticated, username, authToken]);

  // Reset loading state when user becomes unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoggingOut(false);
    }
  }, [isAuthenticated]);

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
        <Button 
          color="inherit" 
          variant="outlined" 
          sx={{ ml: 2 }}
          onClick={handleHealthCheck}
        >
          HealthCheck
        </Button>
        
        {isAuthenticated ? (
          <>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
              sx={{ ml: 2 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '0.875rem'
                }}
              >
                {getInitials()}
              </Avatar>
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{ mt: 1 }}
            >
              <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {givenName || username || 'User'}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => handleMenuItemClick('/profile')}>
                <Person sx={{ mr: 2 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={() => handleMenuItemClick('/leaves')}>
                <EventNote sx={{ mr: 2 }} />
                Leaves
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogoutFromMenu} disabled={isLoggingOut}>
                {isLoggingOut ? (
                  <CircularProgress size={16} sx={{ mr: 2 }} />
                ) : (
                  <Logout sx={{ mr: 2 }} />
                )}
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button 
            color="inherit" 
            variant="outlined" 
            sx={{ ml: 2 }}
            onClick={handleAuthClick}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;