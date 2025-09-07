import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip, InputAdornment } from '@mui/material';
import { Edit, Block, CheckCircle, LockReset, Visibility, VisibilityOff } from '@mui/icons-material';
import { User } from '../../models/User';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { tableStyles } from '../../styles/tableStyles';
import { showConfirm } from '../../utils/confirm';
import { handleApiResponse } from '../../utils/apiHandler';
import PageHeader from '../../components/PageHeader';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ given_name: '', family_name: '', email: '', phone_number: '' });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'enabled' | 'disabled' | 'all'>('enabled');
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<string>('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);
  const { isAuthenticated, username: currentUsername } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAuthenticated, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    await handleApiResponse(
      () => userService.getUsers(),
      (data) => {
        setUsers(Array.isArray(data) ? data : data?.users || []);
      },
      () => setUsers([])
    );
    setLoading(false);
  };

  const toggleUserStatus = async (username: string, isEnabled: boolean) => {
    const action = isEnabled ? 'disable' : 'enable';
    if (!(await showConfirm(`This will ${action} the user account immediately.`, `${action === 'disable' ? 'Deactivate' : 'Activate'} ${username}?`))) return;
    
    await handleApiResponse(
      () => isEnabled ? userService.disableUser(username) : userService.enableUser(username),
      () => loadUsers()
    );
  };

  const openResetPasswordModal = (username: string) => {
    setResetPasswordUser(username);
    setTemporaryPassword('');
    setResetPasswordModalOpen(true);
  };

  const closeResetPasswordModal = () => {
    setResetPasswordModalOpen(false);
    setResetPasswordUser('');
    setTemporaryPassword('');
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!temporaryPassword.trim()) return;
    
    setSaving(true);
    await handleApiResponse(
      () => userService.resetPassword(resetPasswordUser, temporaryPassword),
      () => {
        loadUsers();
        closeResetPasswordModal();
      }
    );
    setSaving(false);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      given_name: user.given_name || '',
      family_name: user.family_name || '',
      email: user.email,
      phone_number: user.phone_number
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
    setEditForm({ given_name: '', family_name: '', email: '', phone_number: '' });
    setSaving(false);
  };

  const handleFormChange = (field: keyof typeof editForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleEditSubmit = async () => {
    if (!editingUser) return;
    if (!(await showConfirm('Are you sure you want to save these changes?'))) return;
    
    setSaving(true);
    const updates: Partial<typeof editForm> = {};
    if (editForm.given_name !== (editingUser.given_name || '')) updates.given_name = editForm.given_name;
    if (editForm.family_name !== (editingUser.family_name || '')) updates.family_name = editForm.family_name;
    if (editForm.email !== editingUser.email) updates.email = editForm.email;
    if (editForm.phone_number !== editingUser.phone_number) updates.phone_number = editForm.phone_number;
    
    await handleApiResponse(
      () => userService.updateUser(editingUser.username, updates),
      () => {
        loadUsers();
        closeEditModal();
      }
    );
    setSaving(false);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.given_name && user.given_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.family_name && user.family_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'enabled' && user.enabled) ||
        (statusFilter === 'disabled' && !user.enabled);
      
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="User Management" />
      <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as 'enabled' | 'disabled' | 'all')}
            >
              <MenuItem value="enabled">Enabled</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button variant="contained" onClick={() => navigate('/admin/users/create')}>Create User</Button>
      </Box>
      <TableContainer component={Paper} sx={tableStyles.container}>
        <Table>
          <TableHead>
            <TableRow sx={tableStyles.headerRow}>
              <TableCell sx={tableStyles.headerCell}>Username</TableCell>
              <TableCell sx={tableStyles.headerCell}>Given Name</TableCell>
              <TableCell sx={tableStyles.headerCell}>Last Name</TableCell>
              <TableCell sx={tableStyles.headerCell}>Email</TableCell>
              <TableCell sx={tableStyles.headerCell}>Phone</TableCell>
              <TableCell sx={tableStyles.headerCell}>Created</TableCell>
              <TableCell sx={tableStyles.headerCell}>Status</TableCell>
              <TableCell sx={tableStyles.headerCell}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              Array.isArray(filteredUsers) && filteredUsers.map((user, index) => (
                <TableRow key={user.username} sx={tableStyles.bodyRow(index === filteredUsers.length - 1)}>
                  <TableCell sx={tableStyles.bodyCell}>{user.username}</TableCell>
                  <TableCell sx={tableStyles.bodyCell}>{user.given_name || '-'}</TableCell>
                  <TableCell sx={tableStyles.bodyCell}>{user.family_name || '-'}</TableCell>
                  <TableCell sx={tableStyles.bodyCell}>{user.email}</TableCell>
                  <TableCell sx={tableStyles.bodyCell}>{user.phone_number}</TableCell>
                  <TableCell sx={tableStyles.bodyCell}>{new Date(user.created).toLocaleDateString()}</TableCell>
                  <TableCell sx={tableStyles.bodyCell}>
                    <Chip 
                      label={user.enabled ? 'Enabled' : 'Disabled'} 
                      color={user.enabled ? 'success' : 'default'} 
                    />
                  </TableCell>
                  <TableCell sx={tableStyles.bodyCell}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => openEditModal(user)}
                            disabled={!user.enabled}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={user.enabled ? 'Disable' : 'Enable'}>
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => toggleUserStatus(user.username, user.enabled)}
                            disabled={user.username === currentUsername}
                          >
                            {user.enabled ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Reset Password">
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => openResetPasswordModal(user.username)}
                            disabled={!user.enabled || user.username === currentUsername}
                          >
                            <LockReset fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={editModalOpen} onClose={closeEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User - {editingUser?.username}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {[
              { field: 'given_name' as const, label: 'First Name' },
              { field: 'family_name' as const, label: 'Last Name' },
              { field: 'email' as const, label: 'Email', type: 'email' },
              { field: 'phone_number' as const, label: 'Phone' }
            ].map(({ field, label, type }) => (
              <TextField
                key={field}
                label={label}
                type={type}
                value={editForm[field]}
                onChange={handleFormChange(field)}
                fullWidth
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal} disabled={saving}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={resetPasswordModalOpen} onClose={closeResetPasswordModal} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password - {resetPasswordUser}</DialogTitle>
        <DialogContent>
          <TextField
            label="New Temporary Password"
            type={showTemporaryPassword ? 'text' : 'password'}
            value={temporaryPassword}
            onChange={(e) => setTemporaryPassword(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowTemporaryPassword(!showTemporaryPassword)}
                    edge="end"
                  >
                    {showTemporaryPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeResetPasswordModal} disabled={saving}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" disabled={saving || !temporaryPassword.trim()}>
            {saving ? <CircularProgress size={20} /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList;