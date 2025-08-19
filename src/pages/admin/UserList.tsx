import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { User, UserResponse } from '../../models/User';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAuthenticated, navigate]);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      setUsers([]);
    }
  };

  const toggleUserStatus = async (username: string, isEnabled: boolean) => {
    if (isEnabled) {
      await userService.disableUser(username);
    } else {
      await userService.enableUser(username);
    }
    loadUsers();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="contained" onClick={() => navigate('/admin/users/create')}>Create User</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) && users.map((user) => (
              <TableRow key={user.username}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone_number}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.enabled ? 'Enabled' : 'Disabled'} 
                    color={user.enabled ? 'success' : 'default'} 
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    onClick={() => toggleUserStatus(user.username, user.enabled)}
                  >
                    {user.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserList;