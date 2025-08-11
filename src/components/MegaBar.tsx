import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Paper } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';

const MegaBar: React.FC = () => {
  const [showCompanyOptions, setShowCompanyOptions] = useState(false);
  const navigate = useNavigate();
  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setShowCompanyOptions(true);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => setShowCompanyOptions(false), 200);
  };

  return (
    <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', position: 'relative' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, py: 2 }}>
          <Button
            variant="text"
            sx={{ 
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
            }}
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
              sx={{
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
              }}
            >
              {item}
            </Button>
          ))}
        </Box>
        
        {showCompanyOptions && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              bgcolor: 'white',
              borderRadius: 0,
              borderTop: '3px solid',
              borderColor: 'primary.main',
              animation: 'slideDown 0.2s ease-out'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Container maxWidth="lg">
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8, py: 3 }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/company/register')}
                  sx={{
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
                  }}
                >
                  Register
                </Button>
                <Button
                  variant="text"
                  onClick={() => navigate('/company/list')}
                  sx={{
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
                  }}
                >
                  List
                </Button>
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