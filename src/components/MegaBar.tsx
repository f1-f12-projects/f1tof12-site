import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { roleHelper } from '../utils/roleHelper';

const MegaBar: React.FC = () => {
  const [showCompanyOptions, setShowCompanyOptions] = useState(false);
  const [showAdminOptions, setShowAdminOptions] = useState(false);
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  const visibleMenuItems = useMemo(() => 
    userRole ? roleHelper.getVisibleMenuItems(userRole) : [], 
    [userRole]
  );

  const styles = useMemo(() => ({
    mainButton: {
      color: 'text.primary',
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '1rem',
      px: 3,
      py: 1.5,
      borderRadius: 2,
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: 'primary.main',
        color: 'white',
        transform: 'translateY(-1px)'
      }
    },
    dropdownPaper: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 1000,
      bgcolor: 'background.paper',
      borderRadius: 0,
      borderTop: '3px solid',
      borderColor: 'primary.main',
      animation: 'slideDown 0.2s ease-out'
    },
    dropdownButton: {
      color: 'text.primary',
      fontWeight: 500,
      textTransform: 'none',
      fontSize: '0.95rem',
      px: 4,
      py: 2,
      borderRadius: 3,
      border: '1px solid transparent',
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: 'primary.light',
        color: 'primary.dark',
        border: '1px solid',
        borderColor: 'primary.main',
        transform: 'scale(1.05)'
      }
    }
  }), []);

  const menuItems = useMemo(() => ({
    company: [
      { label: 'Register New Company', path: '/company/register' },
      { label: 'Show Companies', path: '/company/list' },
      { label: 'SPOC', path: '/company/spoc' }
    ],
    admin: [
      { label: 'Manage Users', path: '/admin/users' },
      { label: 'Create User', path: '/admin/users/create' }
    ],
    main: [
      { label: 'Candidates', path: '/candidates' },
      { label: 'Interviews', path: '/interviews' },
      { label: 'Reports', path: '/reports' },
      { label: 'Finance', path: '/finance' }
    ]
  }), []);

  const createDropdownHandlers = useCallback((setter: (show: boolean) => void) => {
    let timeoutId: NodeJS.Timeout;
    return {
      onMouseEnter: () => {
        clearTimeout(timeoutId);
        setter(true);
      },
      onMouseLeave: () => {
        timeoutId = setTimeout(() => setter(false), 200);
      }
    };
  }, []);

  const companyHandlers = useMemo(() => createDropdownHandlers(setShowCompanyOptions), [createDropdownHandlers]);
  const adminHandlers = useMemo(() => createDropdownHandlers(setShowAdminOptions), [createDropdownHandlers]);

  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, py: 2 }}>
          {visibleMenuItems.includes('/companies') && (
            <Button
              variant="text"
              sx={styles.mainButton}
              {...companyHandlers}
              endIcon={<KeyboardArrowDown sx={{ 
                transform: showCompanyOptions ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} />}
            >
              Company
            </Button>
          )}
          
          {menuItems.main.map(({ label, path }) => 
            visibleMenuItems.includes(path) && (
              <Button
                key={path}
                variant="text"
                onClick={() => navigate(path)}
                sx={styles.mainButton}
              >
                {label}
              </Button>
            )
          )}
          
          {visibleMenuItems.includes('/admin') && (
            <Button
              variant="text"
              sx={styles.mainButton}
              {...adminHandlers}
              endIcon={<KeyboardArrowDown sx={{ 
                transform: showAdminOptions ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} />}
            >
              Admin
            </Button>
          )}
        </Box>
        
        {showCompanyOptions && visibleMenuItems.includes('/companies') && (
          <Paper elevation={8} sx={styles.dropdownPaper} {...companyHandlers}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8, py: 3 }}>
                {menuItems.company.map(({ label, path }) => (
                  <Button
                    key={path}
                    variant="text"
                    onClick={() => navigate(path)}
                    sx={styles.dropdownButton}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
            </Container>
          </Paper>
        )}
        
        {showAdminOptions && visibleMenuItems.includes('/admin') && (
          <Paper elevation={8} sx={styles.dropdownPaper} {...adminHandlers}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8, py: 3 }}>
                {menuItems.admin.map(({ label, path }) => (
                  <Button
                    key={path}
                    variant="text"
                    onClick={() => navigate(path)}
                    sx={styles.dropdownButton}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
            </Container>
          </Paper>
        )}
      </Container>
      
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default MegaBar;