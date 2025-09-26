import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <Box sx={{ 
      p: 2, 
      background: (theme) => theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' 
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      borderRadius: '16px 16px 0 0' 
    }}>
      <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;