import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { Schedule, CheckCircle, Close } from '@mui/icons-material';
import { Leave, leaveService } from '../../../services/leaveService';
import { useAuth } from '../../../context/AuthContext';

interface LeaveStatsProps {
  isHR: boolean;
  leaves?: Leave[];
}

const LeaveStats: React.FC<LeaveStatsProps> = ({ isHR, leaves = [] }) => {
  const pendingLeaves = leaves.filter(leave => leave.status === 'pending');
  const approvedLeaves = leaves.filter(leave => leave.status === 'approved');
  const rejectedLeaves = leaves.filter(leave => leave.status === 'rejected');

  if (leaves.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <Schedule sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Pending
            </Typography>
            <Typography variant="h4" color="warning.main">
              {pendingLeaves.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Approved
            </Typography>
            <Typography variant="h4" color="success.main">
              {approvedLeaves.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center' }}>
            <Close sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Rejected
            </Typography>
            <Typography variant="h4" color="error.main">
              {rejectedLeaves.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LeaveStats;