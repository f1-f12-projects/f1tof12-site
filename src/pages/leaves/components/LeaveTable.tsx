import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Stack, Box, Typography } from '@mui/material';
import { Check, Close, EventBusy } from '@mui/icons-material';
import { Leave, leaveService } from '../../../services/leaveService';
import { formatDateOnly } from '../../../utils/dateUtils';

interface LeaveTableProps {
  isHR: boolean;
  onLeaveAction: (leaveId: number, action: 'approve' | 'reject') => void;
  leaves?: Leave[];
}

const LeaveTable: React.FC<LeaveTableProps> = ({ isHR, onLeaveAction, leaves = [] }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const displayLeaves = isHR ? leaves : leaves.filter(leave => !isHR);

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            {isHR && <TableCell>Employee</TableCell>}
            <TableCell>Leave Type</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Applied Date</TableCell>
            {isHR && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayLeaves.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isHR ? 8 : 6} sx={{ textAlign: 'center', py: 6 }}>
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
            displayLeaves.map((leave) => (
              <TableRow key={leave.id}>
                {isHR && <TableCell>Employee</TableCell>}
                <TableCell sx={{ textTransform: 'capitalize' }}>{leave.leave_type}</TableCell>
                <TableCell>{formatDateOnly(leave.start_date)}</TableCell>
                <TableCell>{formatDateOnly(leave.end_date)}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>
                  <Chip 
                    label={leave.status.toUpperCase()} 
                    color={getStatusColor(leave.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDateOnly(leave.created_date)}</TableCell>
                {isHR && (
                  <TableCell>
                    {leave.status === 'pending' && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<Check />}
                          onClick={() => onLeaveAction(leave.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<Close />}
                          onClick={() => onLeaveAction(leave.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeaveTable;