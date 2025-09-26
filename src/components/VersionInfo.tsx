import React from 'react';
import { Typography, Box } from '@mui/material';
import { APP_VERSION, BUILD_DATE, APP_NAME } from '../utils/version';

const VersionInfo: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">
        {APP_NAME} v{APP_VERSION} • Built on {BUILD_DATE}
      </Typography>
    </Box>
  );
};

export default VersionInfo;