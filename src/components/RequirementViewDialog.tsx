import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Box, Card, Chip, TextField, MenuItem, CircularProgress } from '@mui/material';
import { Visibility, Edit } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { Requirement } from '../models/Requirement';
import { RequirementStatus } from '../models/RequirementStatus';
import { formatDateOnly } from '../utils/dateUtils';

interface RequirementViewDialogProps {
  open: boolean;
  onClose: () => void;
  requirement: Requirement | null;
  getStatusColor: (statusId: number) => any;
  statuses: RequirementStatus[];
  onStatusUpdate: (requirementId: number, statusId: number) => void;
  onRequirementUpdate?: (requirement: Requirement) => void;
}

const RequirementViewDialog: React.FC<RequirementViewDialogProps> = ({
  open,
  onClose,
  requirement,
  getStatusColor,
  statuses,
  onStatusUpdate,
  onRequirementUpdate
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { userRole } = useAuth();
  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [editingProject, setEditingProject] = useState(false);
  const [projectData, setProjectData] = useState({ location: '', budget: '', expected_billing_date: '' });
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const canEditStatus = userRole === 'lead' || userRole === 'manager';
  
  useEffect(() => {
    if (showConfirm) {
      setRemarks('');
    }
  }, [showConfirm]);

  useEffect(() => {
    if (requirement && editingProject) {
      setProjectData({
        location: requirement.location || '',
        budget: requirement.budget?.toString() || '',
        expected_billing_date: requirement.expected_billing_date || ''
      });
    }
  }, [requirement, editingProject]);
  
  const handleStatusEdit = () => {
    if (requirement) {
      setSelectedStatus(requirement.status_id);
      setEditingStatus(true);
    }
  };
  
  const handleStatusChange = () => {
    if (requirement && selectedStatus !== requirement.status_id) {
      setShowConfirm(true);
    } else {
      setEditingStatus(false);
    }
  };

  const handleStatusSave = async () => {
    if (requirement) {
      const { requirementService } = await import('../services/requirementService');
      setLoading(true);
      const { handleRequirementStatus }: { handleRequirementStatus: any } = await import('../pages/requirements/requirementUtils');
      await handleRequirementStatus(
        requirement.requirement_id,
        selectedStatus,
        (apiCall: any, onSuccess: any) => {
          return apiCall().then(async () => {
            onStatusUpdate(requirement.requirement_id, selectedStatus);
            const response = await requirementService.getRequirement(requirement.requirement_id);
            if (response.success && response.data && onRequirementUpdate) {
              onRequirementUpdate(response.data);
            }
            if (onSuccess) onSuccess();
          });
        },
        () => {},
        remarks
      );
      setLoading(false);
    }
    setShowConfirm(false);
    setEditingStatus(false);
  };

  const handleProjectSave = async () => {
    if (requirement) {
      const { requirementService } = await import('../services/requirementService');
      setLoading(true);
      try {
        const updateData: any = {};
        if (projectData.location !== (requirement.location || '')) {
          updateData.location = projectData.location;
        }
        if (projectData.budget !== (requirement.budget?.toString() || '')) {
          updateData.budget = projectData.budget ? Number(projectData.budget) : undefined;
        }
        if (projectData.expected_billing_date !== (requirement.expected_billing_date || '')) {
          updateData.expected_billing_date = projectData.expected_billing_date || undefined;
        }
        const response = await requirementService.updateRequirement(requirement.requirement_id, updateData);
        if (response.success && onRequirementUpdate) {
          const updatedReq = await requirementService.getRequirement(requirement.requirement_id);
          if (updatedReq.success && updatedReq.data) {
            onRequirementUpdate(updatedReq.data);
          }
        }
        setEditingProject(false);
      } catch (error) {
        console.error('Error updating project details:', error);
      }
      setLoading(false);
    }
  };

  const handleCommentSave = async () => {
    if (requirement && newComment.trim()) {
      const { requirementService } = await import('../services/requirementService');
      setLoading(true);
      try {
        const response = await requirementService.addComment(requirement.requirement_id, newComment.trim());
        if (response.success && onRequirementUpdate) {
          const updatedReq = await requirementService.getRequirement(requirement.requirement_id);
          if (updatedReq.success && updatedReq.data) {
            onRequirementUpdate(updatedReq.data);
          }
        }
        setNewComment('');
        setShowCommentDialog(false);
      } catch (error) {
        console.error('Error adding comment:', error);
      }
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: 4, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: theme.palette.background.paper
        } 
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        pt: 4,
        px: 4,
        fontWeight: 700,
        fontSize: '1.5rem',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #42a5f5 100%)`,
        color: 'white',
        borderRadius: '16px 16px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Visibility sx={{ fontSize: 28 }} />
        Requirement Details - {requirement?.requirement_id}
      </DialogTitle>
      <DialogContent sx={{ p: 4, pt: 4 }}>
        {requirement && (
          <Stack spacing={4}>
            <Card sx={{ p: 3, borderRadius: 3, background: theme.palette.background.default, border: `1px solid ${theme.palette.primary.main}` }}>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 600 }}>
                Basic Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ p: 2, borderRadius: 2, background: `${theme.palette.primary.main}${isDark ? '20' : '08'}` }}>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Company
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {requirement.company_name || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, background: `${theme.palette.primary.main}${isDark ? '20' : '08'}` }}>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Key Skill
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {requirement.key_skill}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, background: `${theme.palette.primary.main}${isDark ? '20' : '08'}` }}>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Recruiter
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {requirement.recruiter_name || 'Not assigned'}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, background: `${theme.palette.primary.main}${isDark ? '20' : '08'}` }}>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Created Date
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {formatDateOnly(requirement.created_date)}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, background: `${theme.palette.primary.main}${isDark ? '20' : '08'}` }}>
                  <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {editingStatus ? (
                      <TextField
                        select
                        size="small"
                        value={selectedStatus}
                        onChange={(e) => {
                          const newStatus = Number(e.target.value);
                          if (newStatus !== requirement.status_id) {
                            setSelectedStatus(newStatus);
                            setShowConfirm(true);
                          }
                        }}
                        sx={{ minWidth: 120 }}
                      >
                        {statuses.map(status => (
                          <MenuItem key={status.id} value={status.id}>
                            {status.status}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <Chip 
                        label={(() => {
                          console.log('Requirement status_id:', requirement.status_id);
                          console.log('Available statuses:', statuses);
                          const foundStatus = statuses.find(s => s.id === requirement.status_id);
                          console.log('Found status:', foundStatus);
                          return foundStatus?.status || `Unknown (ID: ${requirement.status_id})`;
                        })()}
                        color={getStatusColor(requirement.status_id)}
                        variant="filled"
                        sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                      />
                    )}
                    {canEditStatus && (
                      <Button
                        size="small"
                        onClick={editingStatus ? handleStatusChange : handleStatusEdit}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        <Edit fontSize="small" />
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 3, borderRadius: 3, background: theme.palette.background.default, border: `1px solid ${isDark ? '#66bb6a' : '#4caf50'}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: isDark ? '#66bb6a' : '#4caf50', fontWeight: 600 }}>
                  Project Details
                </Typography>
                {canEditStatus && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {editingProject && (
                      <Button size="small" onClick={() => setEditingProject(false)}>Cancel</Button>
                    )}
                    <Button
                      size="small"
                      onClick={() => editingProject ? handleProjectSave() : setEditingProject(true)}
                      disabled={loading}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      {editingProject ? (loading ? <CircularProgress size={16} /> : 'Save') : <Edit fontSize="small" />}
                    </Button>
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ p: 2, borderRadius: 2, background: isDark ? 'rgba(102, 187, 106, 0.2)' : 'rgba(76, 175, 80, 0.08)' }}>
                  <Typography variant="caption" sx={{ color: isDark ? '#66bb6a' : '#4caf50', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Location
                  </Typography>
                  {editingProject ? (
                    <TextField
                      size="small"
                      value={projectData.location}
                      onChange={(e) => setProjectData(prev => ({ ...prev, location: e.target.value }))}
                      sx={{ mt: 0.5, width: '100%' }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                      {requirement.location || 'Not specified'}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, background: isDark ? 'rgba(102, 187, 106, 0.2)' : 'rgba(76, 175, 80, 0.08)' }}>
                  <Typography variant="caption" sx={{ color: isDark ? '#66bb6a' : '#4caf50', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Budget
                  </Typography>
                  {editingProject ? (
                    <TextField
                      size="small"
                      type="number"
                      value={projectData.budget}
                      onChange={(e) => setProjectData(prev => ({ ...prev, budget: e.target.value }))}
                      sx={{ mt: 0.5, width: '100%' }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                      {requirement.budget ? `₹${requirement.budget.toLocaleString()}` : 'Not specified'}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, background: isDark ? 'rgba(102, 187, 106, 0.2)' : 'rgba(76, 175, 80, 0.08)' }}>
                  <Typography variant="caption" sx={{ color: isDark ? '#66bb6a' : '#4caf50', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Expected Billing
                  </Typography>
                  {editingProject ? (
                    <TextField
                      size="small"
                      type="date"
                      value={projectData.expected_billing_date}
                      onChange={(e) => setProjectData(prev => ({ ...prev, expected_billing_date: e.target.value }))}
                      sx={{ mt: 0.5, width: '100%' }}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                      {formatDateOnly(requirement.expected_billing_date) || 'Not set'}
                    </Typography>
                  )}
                </Box>
              </Box>

            </Card>

            <Card sx={{ p: 3, borderRadius: 3, background: theme.palette.background.default, border: `1px solid ${isDark ? '#ffb74d' : '#ff9800'}` }}>
              <Typography variant="h6" sx={{ mb: 2, color: isDark ? '#ffb74d' : '#ff9800', fontWeight: 600 }}>
                Job Description
              </Typography>
              <Box sx={{ p: 3, borderRadius: 2, background: isDark ? 'rgba(255, 183, 77, 0.2)' : 'rgba(255, 152, 0, 0.08)', border: `1px solid ${isDark ? '#ffb74d' : '#ff9800'}` }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {requirement.jd || 'No description available'}
                </Typography>
              </Box>
            </Card>

            <Card sx={{ p: 3, borderRadius: 3, background: theme.palette.background.default, border: `1px solid ${isDark ? '#ba68c8' : '#9c27b0'}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: isDark ? '#ba68c8' : '#9c27b0', fontWeight: 600 }}>
                  Remarks
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowCommentDialog(true)}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <Edit fontSize="small" />
                </Button>
              </Box>
              <Box sx={{ p: 3, borderRadius: 2, background: isDark ? 'rgba(186, 104, 200, 0.2)' : 'rgba(156, 39, 176, 0.08)', border: `1px solid ${isDark ? '#ba68c8' : '#9c27b0'}` }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {requirement.remarks || 'No remarks available'}
                </Typography>
              </Box>
            </Card>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 4, pt: 2, background: theme.palette.action.hover }}>
        {editingStatus && (
          <Button 
            onClick={() => setEditingStatus(false)}
            sx={{ borderRadius: 3 }}
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={editingStatus ? handleStatusChange : onClose}
          variant="contained"
          sx={{ 
            borderRadius: 3, 
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: `0 4px 12px ${theme.palette.primary.main}30`
          }}
        >
          {editingStatus ? 'Save' : 'Close'}
        </Button>
      </DialogActions>
      
      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Are you sure you want to update the status?</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks (Optional)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any remarks for this status change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button onClick={handleStatusSave} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showCommentDialog} onClose={() => setShowCommentDialog(false)}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Enter your comment..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCommentDialog(false)}>Cancel</Button>
          <Button onClick={handleCommentSave} variant="contained" disabled={loading || !newComment.trim()}>
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default RequirementViewDialog;