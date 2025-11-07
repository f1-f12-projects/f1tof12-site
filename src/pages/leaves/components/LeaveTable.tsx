import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Stack, Box, Typography } from '@mui/material';
import { Check, Close, EventBusy } from '@mui/icons-material';
import { Leave, leaveService } from '../../../services/leaveService';
import { formatDateOnly } from '../../../utils/dateUtils';

interface LeaveTableProps {
  isHR: boolean;
  leaves?: Leave[];
}

const LeaveTable: React.FC<LeaveTableProps> = ({ isHR, leaves = [] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const displayLeaves = isHR ? leaves : leaves.filter(leave => !isHR);

  return (
    <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, elevation: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            {isHR && <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Employee</TableCell>}
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Leave Type</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Start Date</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>End Date</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Days</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Reason</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Applied Date</TableCell>
            {isHR && <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayLeaves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isHR ? 9 : 7} sx={{ textAlign: 'center', py: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <EventBusy sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No leave records found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isHR ? 'No employee leave requests to display' : 'You haven\'t applied for any leaves yet'}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            displayLeaves.map((leave, index) => (
              <TableRow 
                key={leave.id}
                sx={{
                  bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.2s ease'
                }}
              >
                {isHR && <TableCell sx={{ fontWeight: 500 }}>Employee</TableCell>}
                <TableCell sx={{ textTransform: 'capitalize', fontWeight: 500 }}>{leave.leave_type}</TableCell>
                <TableCell>{formatDateOnly(leave.start_date)}</TableCell>
                <TableCell>{formatDateOnly(leave.end_date)}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{leave.days}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>
                  <Chip 
                    label={leave.status} 
                    color={getStatusColor(leave.status) as any}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>{formatDateOnly(leave.created_date)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeaveTable;