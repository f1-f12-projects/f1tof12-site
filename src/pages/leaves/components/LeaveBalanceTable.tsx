import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { tableStyles } from '../../../styles/tableStyles';
import { PendingLeave, leaveService } from '../../../services/leaveService';
import { userService } from '../../../services/userService';

interface LeaveBalanceTableProps {}

const LeaveBalanceTable: React.FC<LeaveBalanceTableProps> = () => {
  const [balanceData, setBalanceData] = useState<PendingLeave[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingLeaves();
  }, []);

  const loadPendingLeaves = async () => {
    try {
      const response = await leaveService.getPendingLeaves();
      if (response.success && response.data) {
        setBalanceData(response.data);
        await fetchUserNames(response.data);
      }
    } catch (error) {
      // Handle error silently or show notification
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNames = async (employees: PendingLeave[]) => {
    const names: Record<string, string> = {};
    for (const employee of employees) {
      const nameData = await userService.getUserName(employee.username);
      names[employee.username] = nameData?.given_name && nameData?.family_name 
        ? `${nameData.given_name} ${nameData.family_name}` 
        : employee.username;
    }
    setUserNames(names);
  };

  return (
  <TableContainer component={Paper} sx={tableStyles.container}>
    <Table>
      <TableHead>
        <TableRow sx={tableStyles.headerRow}>
          <TableCell sx={tableStyles.headerCell}>Employee</TableCell>
          <TableCell align="center" sx={tableStyles.headerCell}>Annual Leave</TableCell>
          <TableCell align="center" sx={tableStyles.headerCell}>Sick Leave</TableCell>
          <TableCell align="center" sx={tableStyles.headerCell}>Casual Leave</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {balanceData?.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} sx={tableStyles.emptyState}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AccountBalance sx={tableStyles.emptyIcon} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No balance data available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Employee leave balances will appear here
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        ) : (
          balanceData?.map((employee, index) => (
            <TableRow key={employee.id || employee.username} sx={tableStyles.bodyRow(index === balanceData.length - 1)}>
              <TableCell sx={{ ...tableStyles.bodyCell, fontWeight: 500 }}>
                {userNames[employee.username] || employee.username}
              </TableCell>
              <TableCell align="center" sx={{ ...tableStyles.bodyCell, fontWeight: 600 }}>
                {employee.annual_leave}
              </TableCell>
              <TableCell align="center" sx={{ ...tableStyles.bodyCell, fontWeight: 600 }}>
                {employee.sick_leave}
              </TableCell>
              <TableCell align="center" sx={{ ...tableStyles.bodyCell, fontWeight: 600 }}>
                {employee.casual_leave}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
  );
};

export default LeaveBalanceTable;