import React from 'react';
import { CssBaseline } from '@mui/material';

const MaterialUIWrapper: React.FC = ({ children }) => {
  return (
    <>
      <CssBaseline />
      {children}
    </>
  );
};

export default MaterialUIWrapper;