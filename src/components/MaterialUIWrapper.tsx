import React from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeContextProvider } from '../context/ThemeContext';

const MaterialUIWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      {children}
    </ThemeContextProvider>
  );
};

export default MaterialUIWrapper;