import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Radio,
  CircularProgress,
  Box,
  Chip,
  Divider
} from '@mui/material';

import { User } from '../models/User';
import { Requirement } from '../models/Requirement';

interface AssignForm {
  recruiter_name: string;
}

interface AssignRecruiterDialogProps {
  open: boolean;
  onClose: () => void;
  assignedUsers: { username: string; given_name: string | null; family_name: string | null }[];
  unassignedUsers: User[];
  assignForm: AssignForm;
  onAssignFormChange: (form: AssignForm) => void;
  onSave: () => void;
  loading: boolean;
  unassignLoading: boolean;
  requirement: Requirement | null;
  onUnassign: (recruiterName: string) => void;
}

const AssignRecruiterDialog: React.FC<AssignRecruiterDialogProps> = ({
  open,
  onClose,
  assignedUsers,
  unassignedUsers,
  assignForm,
  onAssignFormChange,
  onSave,
  loading,
  unassignLoading,
  requirement,
  onUnassign
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 4, fontWeight: 600 }}>
        Assign Recruiter
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {/* Already Assigned Recruiters Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Already Assigned
          </Typography>
          {unassignLoading ? (
            <CircularProgress size={20} />
          ) : assignedUsers.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {assignedUsers.map((recruiter, index) => (
                <Chip 
                  key={index} 
                  label={`${recruiter.given_name || recruiter.username} ${recruiter.family_name || ''}`.trim()} 
                  variant="outlined" 
                  size="small"
                  onDelete={() => onUnassign(recruiter.username)}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recruiters currently assigned
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Assign New Recruiter
        </Typography>
        
        {unassignedUsers.length === 0 ? (
          <Typography>No users available</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Select</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unassignedUsers.map(user => (
                  <TableRow key={user.username}>
                    <TableCell>
                      <Radio
                        checked={assignForm.recruiter_name === user.username}
                        onChange={() => onAssignFormChange({ recruiter_name: user.username })}
                      />
                    </TableCell>
                    <TableCell>{user.given_name ?? '-'}</TableCell>
                    <TableCell>{user.family_name ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button 
          onClick={onSave} 
          variant="contained" 
          disabled={loading}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignRecruiterDialog;