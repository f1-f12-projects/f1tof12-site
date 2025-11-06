import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from '@mui/material';

interface ApplyLeaveDialogProps {
  open: boolean;
  onClose: () => void;
  formData: {
    start_date: string;
    end_date: string;
    leave_type: string;
    reason: string;
  };
  onFormChange: (field: string, value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const ApplyLeaveDialog: React.FC<ApplyLeaveDialogProps> = ({
  open,
  onClose,
  formData,
  onFormChange,
  onSubmit,
  submitting
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Apply for Leave</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            select
            label="Leave Type"
            value={formData.leave_type}
            onChange={(e) => onFormChange('leave_type', e.target.value)}
            fullWidth
          >
            <MenuItem value="sick">Sick Leave</MenuItem>
            <MenuItem value="casual">Casual Leave</MenuItem>
            <MenuItem value="annual">Annual Leave</MenuItem>
          </TextField>
          <TextField
            type="date"
            label="Start Date"
            value={formData.start_date}
            onChange={(e) => onFormChange('start_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            type="date"
            label="End Date"
            value={formData.end_date}
            onChange={(e) => onFormChange('end_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            multiline
            rows={3}
            label="Reason"
            value={formData.reason}
            onChange={(e) => onFormChange('reason', e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplyLeaveDialog;