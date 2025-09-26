import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { Construction } from '@mui/icons-material';

const ComingSoon: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
        <Construction sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Coming Soon
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          This page is under development
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We're working hard to bring you this feature. Please check back soon!
        </Typography>
      </Paper>
    </Container>
  );
};

export default ComingSoon;