import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, Card, Chip, IconButton, Snackbar, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Profile } from '../../../models/Profile';
import { profileStatusService } from '../../../services/profileStatusService';
import { profileService } from '../../../services/profileService';
import { formatINR } from '../../../utils/currencyUtils';

interface ProfileContentProps {
  profile: Profile;
  copyToClipboard: (text: string, label: string) => void;
  currentStatus: string;
}

const ProfileContent: React.FC<ProfileContentProps> = React.memo(({ profile, copyToClipboard, currentStatus }) => {
  const sections = useMemo(() => [
    {
      title: '📞 Contact Information',
      items: [
        { label: 'Email: ', value: profile.email },
        { label: 'Phone: ', value: profile.phone }
      ]
    },
    {
      title: '🎯 Professional Details',
      items: [
        { label: 'Experience: ', value: `${profile.experience_years} years` },
        { label: 'Skills: ', value: profile.skills }
      ]
    },
    {
      title: '📍 Location Preferences',
      items: [
        { label: 'Current: ', value: profile.current_location },
        { label: 'Preferred: ', value: profile.preferred_location }
      ]
    },
    {
      title: '💰 Compensation & Availability',
      items: [
        { label: 'Current CTC: ', value: formatINR(profile.current_ctc) },
        { label: 'Expected CTC: ', value: formatINR(profile.expected_ctc) },
        { label: 'Notice Period: ', value: profile.notice_period || 'Not specified' }
      ]
    }
  ], [profile]);

  return (
    <Grid container spacing={3}>
      {sections.map((section, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Card sx={{ 
            p: 3, 
            height: 180, 
            background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' : 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)', 
            borderRadius: 4,
            boxShadow: 'none',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#555' : '#e0e0e0'}`,
            '&:hover': { 
              background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #616161 0%, #757575 100%)' : 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
              borderColor: 'primary.main'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            ...((index === 0 || index === 1) && { mt: 2 }) 
          }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, color: 'primary.main' }}>
              {section.title}
            </Typography>
            {section.items.map((item, itemIndex) => (
              <Typography key={itemIndex} sx={{ mb: itemIndex < section.items.length - 1 ? 1 : 0, color: (theme) => theme.palette.text.primary, display: 'flex', alignItems: 'center' }}>
                <span><strong>{item.label}</strong></span>
                <span style={{ marginLeft: '4px' }}>{item.value}</span>
                {(item.label === 'Email: ' || item.label === 'Phone: ') && (
                  <IconButton size="small" onClick={() => copyToClipboard(item.value, item.label)} sx={{ ml: 0.5, p: 0.5 }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                )}
              </Typography>
            ))}
          </Card>
        </Grid>
      ))}
      
      {(currentStatus.toLowerCase().includes('offer accepted') || currentStatus.toLowerCase().includes('joined')) && (
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 3, 
            height: 180, 
            background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' : 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)', 
            borderRadius: 4,
            boxShadow: 'none',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#555' : '#e0e0e0'}`,
            '&:hover': { 
              background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #616161 0%, #757575 100%)' : 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
              borderColor: 'primary.main'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            mt: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, color: 'primary.main' }}>
              🎉 Offer & Joining Details
            </Typography>
            {profile.accepted_offer && (
              <Typography sx={{ mb: 1, color: (theme) => theme.palette.text.primary, display: 'flex', alignItems: 'center' }}>
                <span><strong>Accepted Offer:</strong></span>
                <span style={{ marginLeft: '4px' }}>{formatINR(profile.accepted_offer)}</span>
              </Typography>
            )}
            {profile.joining_date && (
              <Typography sx={{ mb: 1, color: (theme) => theme.palette.text.primary, display: 'flex', alignItems: 'center' }}>
                <span><strong>Joining Date:</strong></span>
                <span style={{ marginLeft: '4px' }}>{profile.joining_date}</span>
              </Typography>
            )}

          </Card>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Card sx={{ 
          p: 3, 
          background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' : 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)', 
          borderRadius: 4,
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          '&:hover': { 
            background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #616161 0%, #757575 100%)' : 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
            borderColor: 'primary.main'
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, color: 'primary.main' }}>
            📝 Additional Notes
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={profile.remarks || ''}
            placeholder="No remarks available"
            InputProps={{
              readOnly: true,
              sx: {
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                }
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  );
});

interface ProfileData {
  profile_id: number | null;
  id: number;
  recruiter_name: string;
  remarks: string;
  requirement_id: number;
  status_id: number;
  profile?: Profile;
}

interface ProfileDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  profileData: ProfileData | null;
  onStatusUpdate?: (profileId: number, newStatus: number) => void;
}

const ProfileDetailsDialog: React.FC<ProfileDetailsDialogProps> = ({ open, onClose, profileData, onStatusUpdate }) => {
  const [state, setState] = useState({
    selectedStatus: '',
    selectedStage: '',
    statusOptions: [] as string[],
    stageOptions: [] as {stage: string, id: number}[],
    showConfirmation: false,
    copyMessage: '',
    showCopySnackbar: false,
    remarks: '',
    acceptedOffer: '',
    joiningDate: '',
    isUpdating: false,
    currentStatusId: null as number | null,
    statusText: '',
    stageText: '',
    showErrorAlert: false,
    errorMessage: ''
  });

  useEffect(() => {
    if (!profileData?.status_id) {
      setState(prev => ({ ...prev, statusText: '', stageText: '' }));
      return;
    }

    const updateTexts = async () => {
      try {
        const [status, stage] = await Promise.all([
          profileStatusService.getStatusById(profileData.status_id),
          profileStatusService.getStageById(profileData.status_id)
        ]);
        setState(prev => ({ ...prev, statusText: status || '', stageText: stage || '' }));
      } catch (error) {
        console.error('Error updating status/stage text:', error);
      }
    };

    updateTexts();
  }, [profileData?.status_id]);

  useEffect(() => {
    if (!profileData) return;

    const loadData = async () => {
      try {
        const stages = await profileStatusService.getStagesWithIds();
        if (!Array.isArray(stages)) return;

        let selectedStage = '';
        let selectedStatus = '';
        let statusOptions: string[] = [];

        if (profileData.status_id) {
          const [status, stage] = await Promise.all([
            profileStatusService.getStatusById(profileData.status_id),
            profileStatusService.getStageById(profileData.status_id)
          ]);

          if (stage) {
            const stageIndex = stages.findIndex(s => s.stage === stage);
            selectedStage = stageIndex !== -1 ? (stageIndex + 1).toString() : '';
            
            statusOptions = await profileStatusService.getStatusesByStage(stage);
            if (status) {
              const statusIndex = statusOptions.findIndex(s => s === status);
              selectedStatus = statusIndex !== -1 ? (statusIndex + 1).toString() : '';
            }
          }
        }

        setState(prev => ({
          ...prev,
          stageOptions: stages,
          selectedStage,
          statusOptions,
          selectedStatus,
          remarks: profileData.profile?.remarks || '',
          currentStatusId: profileData.status_id
        }));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [profileData]);

  if (!profileData) return null;

  const handleStageChange = useCallback(async (newStage: string) => {
    try {
      const stageIndex = parseInt(newStage) - 1;
      const stageName = state.stageOptions[stageIndex].stage;
      const statuses = await profileStatusService.getStatusesByStage(stageName);
      
      let selectedStatus = '';
      let currentStatusId: number | null = null;
      if (profileData?.status_id) {
        const currentStatusName = await profileStatusService.getStatusById(profileData.status_id);
        const statusIndex = statuses.findIndex(status => status === currentStatusName);
        selectedStatus = statusIndex !== -1 ? (statusIndex + 1).toString() : '';
      }
      
      // Update currentStatusId when both stage and status are selected
      if (selectedStatus) {
        const statusName = statuses[parseInt(selectedStatus) - 1];
        currentStatusId = await profileStatusService.getIdByStageAndStatus(stageName, statusName) || null;
      }
      
      setState(prev => ({ ...prev, selectedStage: newStage, statusOptions: statuses, selectedStatus, currentStatusId }));
    } catch (error) {
      console.error('Error loading statuses for stage:', error);
    }
  }, [state.stageOptions, profileData?.status_id]);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    try {
      let currentStatusId: number | null = null;
      if (newStatus && state.selectedStage) {
        const stageIndex = parseInt(state.selectedStage) - 1;
        const statusIndex = parseInt(newStatus) - 1;
        const stageName = state.stageOptions[stageIndex].stage;
        const statusName = state.statusOptions[statusIndex];
        currentStatusId = await profileStatusService.getIdByStageAndStatus(stageName, statusName) || null;
      }
      setState(prev => ({ ...prev, selectedStatus: newStatus, currentStatusId }));
    } catch (error) {
      console.error('Error getting status ID:', error);
      setState(prev => ({ ...prev, selectedStatus: newStatus }));
    }
  }, [state.stageOptions, state.statusOptions, state.selectedStage]);

  const hasChanges = useMemo(() => 
    state.selectedStage && state.selectedStatus && state.currentStatusId !== profileData?.status_id,
    [state.selectedStage, state.selectedStatus, state.currentStatusId, profileData?.status_id]
  );

  const isConfirmDisabled = useMemo(() => {
    if (state.isUpdating) return true;
    
    if (!state.selectedStatus) return false;
    
    const currentStatus = state.statusOptions[parseInt(state.selectedStatus) - 1]?.toLowerCase();
    const requiresFields = currentStatus?.includes('offer accepted') || currentStatus?.includes('joined');
    
    if (!requiresFields) return false;
    
    const hasOffer = state.acceptedOffer || profileData.profile?.accepted_offer;
    const hasJoiningDate = state.joiningDate || profileData.profile?.joining_date;
    
    return !hasOffer || !hasJoiningDate;
  }, [state.isUpdating, state.selectedStatus, state.statusOptions, state.acceptedOffer, state.joiningDate, profileData.profile?.accepted_offer, profileData.profile?.joining_date]);

  const handleUpdateClick = useCallback(() => {
    if (hasChanges) {
      setState(prev => ({ ...prev, remarks: '', showConfirmation: true }));
    }
  }, [hasChanges]);

  const confirmStatusUpdate = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isUpdating: true }));
      const stageIndex = parseInt(state.selectedStage) - 1;
      const statusIndex = parseInt(state.selectedStatus) - 1;
      const stageName = state.stageOptions[stageIndex].stage;
      const statusName = state.statusOptions[statusIndex];
      const statusId = await profileStatusService.getIdByStageAndStatus(stageName, statusName);
      
      if (!statusId) {
        throw new Error('Status ID not found');
      }
      
      await profileService.updateStatus(profileData!.id, statusId, state.remarks);
      
      let hasError = false;
      
      // Update accepted offer and joining date if status is "Offer accepted" and values are provided
      if (statusName.toLowerCase().includes('offer accepted') && profileData?.profile_id) {
        const updateData: any = {};
        if (state.acceptedOffer) {
          updateData.accepted_offer = parseFloat(state.acceptedOffer);
        }
        if (state.joiningDate) {
          updateData.joining_date = state.joiningDate;
        }
        if (Object.keys(updateData).length > 0) {
          try {
            await profileService.updateProfile(profileData.profile_id, updateData);
          } catch (profileError) {
            console.error('Error updating offer details:', profileError);
            setState(prev => ({ ...prev, showErrorAlert: true, errorMessage: 'Failed to update offer details, but status was updated successfully.' }));
            hasError = true;
          }
        }
      }
      
      onStatusUpdate?.(profileData!.id, statusId);
      
      // Close dialog after successful update (only if no errors)
      if (!hasError) {
        onClose();
      } else {
        setState(prev => ({ ...prev, isUpdating: false }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setState(prev => ({ ...prev, isUpdating: false }));
    }
  }, [profileData, state.selectedStatus, state.selectedStage, state.remarks, state.acceptedOffer, state.joiningDate, onStatusUpdate, onClose]);

  const cancelStatusUpdate = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStatusId: profileData?.status_id || null,
      showConfirmation: false
    }));
  }, [profileData?.status_id]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setState(prev => ({ ...prev, copyMessage: `${label} copied to clipboard`, showCopySnackbar: true }));
  }, []);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #2c2c2c 0%, #3c3c3c 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        fontWeight: 700,
        fontSize: '1.5rem',
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            👤 {profileData.profile?.name || 'Unknown Profile'}
            <Chip 
              label={`#${profileData.id}`} 
              size="small" 
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Recruiter: {profileData.recruiter_name || 'Not assigned'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, marginLeft: 'auto' }}>
              <Chip 
                label={state.stageText} 
                color="primary" 
                sx={{ fontSize: '0.9rem', fontWeight: 600 }} 
              />
              <Chip 
                label={state.statusText} 
                color="primary" 
                sx={{ fontSize: '0.9rem', fontWeight: 600 }} 
              />
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {profileData.profile ? (
          <ProfileContent profile={profileData.profile} copyToClipboard={copyToClipboard} currentStatus={state.statusText} />
        ) : (
          <Card sx={{ p: 4, textAlign: 'center', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #2c2c2c 0%, #3c3c3c 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <Typography variant="h6" color="text.secondary">
              Candidate details not available
            </Typography>
          </Card>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #2c2c2c 0%, #3c3c3c 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Stage</InputLabel>
            <Select
              value={state.selectedStage}
              onChange={(e) => handleStageChange(e.target.value as string)}
              label="Stage"
            >
              {state.stageOptions.map((option, index) => (
                <MenuItem key={index} value={(index + 1).toString()}>
                  {option.stage}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={state.selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value as string)}
              label="Status"
            >
              {state.statusOptions.map((option, index) => (
                <MenuItem key={index} value={(index + 1).toString()}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {hasChanges && (
            <Button 
              onClick={handleUpdateClick}
              variant="contained"
              size="small"
              sx={{ ml: 1 }}
            >
              Update
            </Button>
          )}
        </Box>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{ 
            background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': { background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #616161 0%, #757575 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
            px: 4
          }}
        >
          Close
        </Button>
      </DialogActions>

      <Dialog open={state.showConfirmation} onClose={() => setState(prev => ({ ...prev, showConfirmation: false }))}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Are you sure you want to update the status?</Typography>
          {state.selectedStatus && (state.statusOptions[parseInt(state.selectedStatus) - 1]?.toLowerCase().includes('offer accepted') || state.statusOptions[parseInt(state.selectedStatus) - 1]?.toLowerCase().includes('joined')) && (
            <>
              <TextField
                label="Accepted Offer Amount"
                type="number"
                fullWidth
                required
                value={state.acceptedOffer || (profileData.profile?.accepted_offer?.toString() || '')}
                onChange={(e) => setState(prev => ({ ...prev, acceptedOffer: e.target.value }))}
                placeholder="Enter accepted offer amount"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Joining Date"
                type="date"
                fullWidth
                required
                value={state.joiningDate || profileData.profile?.joining_date || ''}
                onChange={(e) => setState(prev => ({ ...prev, joiningDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </>
          )}
          <TextField
            label="Remarks"
            multiline
            rows={3}
            fullWidth
            value={state.remarks}
            onChange={(e) => setState(prev => ({ ...prev, remarks: e.target.value }))}
            placeholder="Add remarks for this status change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelStatusUpdate} disabled={state.isUpdating}>Cancel</Button>
          <Button 
            onClick={confirmStatusUpdate} 
            variant="contained" 
            disabled={isConfirmDisabled}
          >
            {state.isUpdating ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={state.showCopySnackbar}
        autoHideDuration={2000}
        onClose={() => setState(prev => ({ ...prev, showCopySnackbar: false }))}
        message={state.copyMessage}
      />
      
      <Snackbar
        open={state.showErrorAlert}
        autoHideDuration={5000}
        onClose={() => setState(prev => ({ ...prev, showErrorAlert: false }))}
      >
        <Alert severity="warning" onClose={() => setState(prev => ({ ...prev, showErrorAlert: false }))}>
          {state.errorMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ProfileDetailsDialog;