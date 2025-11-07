import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Autocomplete } from '@mui/material';
import { userService } from '../../../services/userService';
import { leaveService } from '../../../services/leaveService';
import { User } from '../../../models/User';

interface AllocateLeaveDialogProps {
  open: boolean;
  onClose: () => void;
  formData: {
    username: string;
    annual_leave: number;
    sick_leave: number;
    casual_leave: number;
  };
  onFormChange: (field: string, value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const AllocateLeaveDialog: React.FC<AllocateLeaveDialogProps> = ({
  open,
  onClose,
  formData,
  onFormChange,
  onSubmit,
  submitting
}) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      const [usersResponse, pendingLeavesResponse] = await Promise.all([
        userService.getUsers(),
        leaveService.getPendingLeaves()
      ]);
      
      if (usersResponse.success && usersResponse.data) {
        const userList = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.users;
        const allocatedUsernames = pendingLeavesResponse.success && pendingLeavesResponse.data 
          ? pendingLeavesResponse.data.map(leave => leave.username) 
          : [];
        
        const availableUsers = (userList || []).filter(user => !allocatedUsernames.includes(user.username));
        setUsers(availableUsers);
      }
    } catch (error) {
      // Handle error silently
    }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Allocate Leave Balance</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Autocomplete
            options={users}
            getOptionLabel={(user) => user.given_name && user.family_name 
              ? `${user.given_name} ${user.family_name} (${user.username})` 
              : user.username}
            value={users.find(user => user.username === formData.username) || null}
            onChange={(_, user) => onFormChange('username', user?.username || '')}
            renderInput={(params) => (
              <TextField {...params} label="Employee" fullWidth />
            )}
            isOptionEqualToValue={(option, value) => option.username === value.username}
          />
          <TextField
            type="number"
            label="Annual Leave"
            value={formData.annual_leave}
            onChange={(e) => onFormChange('annual_leave', e.target.value)}
            fullWidth
          />
          <TextField
            type="number"
            label="Sick Leave"
            value={formData.sick_leave}
            onChange={(e) => onFormChange('sick_leave', e.target.value)}
            fullWidth
          />
          <TextField
            type="number"
            label="Casual Leave"
            value={formData.casual_leave}
            onChange={(e) => onFormChange('casual_leave', e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting}>
          {submitting ? 'Allocating...' : 'Allocate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AllocateLeaveDialog;