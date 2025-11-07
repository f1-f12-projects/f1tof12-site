import React from 'react';
import { Card, CardContent, Typography, Grid, Box, CircularProgress } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { LeaveBalance as LeaveBalanceType } from '../../../services/leaveService';

interface LeaveBalanceProps {
  balance?: LeaveBalanceType;
}

const LeaveBalance: React.FC<LeaveBalanceProps> = ({ balance }) => {
  const defaultBalance = { annual_leave: 0, sick_leave: 0, casual_leave: 0, total_annual: 0, total_sick: 0, total_casual: 0 };
  const displayBalance = balance || defaultBalance;
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary.main">
            Leave Balance
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="body2" color="success.contrastText">
                Annual Leave
              </Typography>
              <Typography variant="h5" color="success.contrastText" sx={{ fontWeight: 'bold' }}>
                {!balance ? <CircularProgress size={24} color="inherit" /> : displayBalance.annual_leave}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="info.contrastText">
                Sick Leave
              </Typography>
              <Typography variant="h5" color="info.contrastText" sx={{ fontWeight: 'bold' }}>
                {!balance ? <CircularProgress size={24} color="inherit" /> : displayBalance.sick_leave}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="body2" color="warning.contrastText">
                Casual Leave
              </Typography>
              <Typography variant="h5" color="warning.contrastText" sx={{ fontWeight: 'bold' }}>
                {!balance ? <CircularProgress size={24} color="inherit" /> : displayBalance.casual_leave}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LeaveBalance;