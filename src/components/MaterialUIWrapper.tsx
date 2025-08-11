import React from 'react';
import { CssBaseline, Container } from '@mui/material';

const MaterialUIWrapper: React.FC = ({ children }) => {
  return (
    <Container>
      <CssBaseline />
      {children}
    </Container>
  );
};

export default MaterialUIWrapper;