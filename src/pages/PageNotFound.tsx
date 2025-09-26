import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <ErrorOutline sx={{ fontSize: 120, color: 'error.main', mb: 3 }} />
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'error.main', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom color="text.primary">
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button 
        variant="contained" 
        size="large" 
        onClick={() => navigate('/')}
        sx={{ px: 4, py: 1.5 }}
      >
        Go Home
      </Button>
    </Container>
  );
};

export default PageNotFound;