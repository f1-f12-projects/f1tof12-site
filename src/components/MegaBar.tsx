import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';

const MegaBar: React.FC = () => {
  const [showCompanyOptions, setShowCompanyOptions] = useState(false);
  const navigate = useNavigate();
  let timeoutId: NodeJS.Timeout;

  const mainButtonStyle = {
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
  };

  const dropdownPaperStyle = {
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
  };

  const dropdownButtonStyle = {
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
  };

  const companyOptions = [
    { label: 'Register New Company', path: '/company/register' },
    { label: 'Show Companies', path: '/company/list' },
    { label: 'SPOC', path: '/company/spoc' }
  ];

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setShowCompanyOptions(true);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => setShowCompanyOptions(false), 200);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, py: 2 }}>
          <Button
            variant="text"
            sx={mainButtonStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            endIcon={<KeyboardArrowDown sx={{ 
              transform: showCompanyOptions ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} />}
          >
            Company
          </Button>
          
          {['Recruiter', 'Profiles', 'Reports'].map((item) => (
            <Button
              key={item}
              variant="text"
              sx={mainButtonStyle}
            >
              {item}
            </Button>
          ))}
          
          <Button
            variant="text"
            onClick={() => navigate('/company/invoices')}
            sx={mainButtonStyle}
          >
            Invoices
          </Button>
        </Box>
        
        {showCompanyOptions && (
          <Paper
            elevation={8}
            sx={dropdownPaperStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Container maxWidth="lg">
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8, py: 3 }}>
                {companyOptions.map(({ label, path }) => (
                  <Button
                    key={label}
                    variant="text"
                    onClick={() => navigate(path)}
                    sx={dropdownButtonStyle}
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