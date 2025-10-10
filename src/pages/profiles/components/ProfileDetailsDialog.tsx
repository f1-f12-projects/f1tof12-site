import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, Card, Chip, Avatar, Divider, Select, MenuItem, FormControl, InputLabel, IconButton, Snackbar, TextField } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Profile } from '../../../models/Profile';
import { profileStatusService } from '../../../services/profileStatusService';
import { ProfileStatus } from '../../../models/ProfileStatus';
import { formatINR } from '../../../utils/currencyUtils';

interface ProfileData {
  profile_id: number | null;
  id: number;
  recruiter_name: string;
  remarks: string;
  requirement_id: number;
  status: number;
  stage?: string;
  profile?: Profile;
}

interface ProfileDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  profileData: ProfileData | null;
  onStatusUpdate?: (profileId: number, newStatus: number) => void;
}

const ProfileDetailsDialog: React.FC<ProfileDetailsDialogProps> = ({ open, onClose, profileData, onStatusUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState<number>(profileData?.status || 1);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [stageText, setStageText] = useState<string>('');
  const [copyMessage, setCopyMessage] = useState('');
  const [showCopySnackbar, setShowCopySnackbar] = useState(false);
  const [remarks, setRemarks] = useState<string>('');

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statuses = await profileStatusService.getStatusList();
        if (Array.isArray(statuses)) {
          setStatusOptions(statuses);
        } else {
          setStatusOptions([]);
        }
      } catch (error) {
        console.error('Error loading statuses:', error);
        setStatusOptions([]);
      }
    };
    loadStatuses();
  }, []);

  useEffect(() => {
    if (!profileData) return;
    
    // Update selected status
    if (profileData.status) {
      setSelectedStatus(profileData.status);
    }
    
    // Update remarks
    setRemarks(profileData.profile?.remarks || '');
    
    // Load status and stage text
    const loadStatusData = async () => {
      if (profileData.status) {
        try {
          const [status, stage] = await Promise.all([
            profileStatusService.getStatusById(profileData.status),
            profileStatusService.getStageById(profileData.status)
          ]);
          setStatusText(status || '');
          setStageText(stage || '');
        } catch (error) {
          console.error('Error loading status:', error);
          setStatusText('');
          setStageText('');
        }
      }
    };
    
    loadStatusData();
  }, [profileData]);
  
  if (!profileData) return null;

  const handleStatusChange = (newStatus: number) => {
    if (newStatus !== profileData.status) {
      setSelectedStatus(newStatus);
      setRemarks('');
      setShowConfirmation(true);
    }
  };

  const confirmStatusUpdate = () => {
    if (onStatusUpdate) {
      onStatusUpdate(profileData.id, selectedStatus);
    }
    setShowConfirmation(false);
  };

  const cancelStatusUpdate = () => {
    setSelectedStatus(profileData.status);
    setShowConfirmation(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(`${label} copied to clipboard`);
    setShowCopySnackbar(true);
  };

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
                label={statusText} 
                color="primary" 
                sx={{ fontSize: '0.9rem', fontWeight: 600 }} 
              />

              <Chip 
                label={stageText} 
                color="primary" 
                sx={{ fontSize: '0.9rem', fontWeight: 600 }} 
              />
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {profileData.profile ? (
          <Grid container spacing={3}>
            {[
              {
                title: '📞 Contact Information',
                items: [
                  { label: 'Email: ', value: profileData.profile.email },
                  { label: 'Phone: ', value: profileData.profile.phone }
                ]
              },
              {
                title: '🎯 Professional Details',
                items: [
                  { label: 'Experience: ', value: `${profileData.profile.experience_years} years` },
                  { label: 'Skills: ', value: profileData.profile.skills }
                ]
              },
              {
                title: '📍 Location Preferences',
                items: [
                  { label: 'Current: ', value: profileData.profile.current_location },
                  { label: 'Preferred: ', value: profileData.profile.preferred_location }
                ]
              },
              {
                title: '💰 Compensation & Availability',
                items: [
                  { label: 'Current CTC: ', value: formatINR(profileData.profile.current_ctc) },
                  { label: 'Expected CTC: ', value: formatINR(profileData.profile.expected_ctc) },
                  { label: 'Notice Period: ', value: profileData.profile.notice_period || 'Not specified' }
                ]
              },
            ].map((section, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ 
                  p: 3, 
                  height: 180, 
                  background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' : 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)', 
                  borderRadius: 4,
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0',
                  '&:hover': { 
                    background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #616161 0%, #757575 100%)' : 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#9c27b0'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  ...((index === 0 || index === 1) && { mt: 2 }) 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, color: '#6a1b9a' }}>
                    {section.title}
                  </Typography>
                  {section.items.map((item, itemIndex) => (
                    <Typography key={itemIndex} sx={{ mb: itemIndex < section.items.length - 1 ? 1 : 0, color: '#424242', display: 'flex', alignItems: 'center' }}>
                      <strong>{item.label}</strong> {item.value}
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
            
            <Grid item xs={12}>
              <Card sx={{ 
                p: 3, 
                background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' : 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)', 
                borderRadius: 4,
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                '&:hover': { 
                  background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #616161 0%, #757575 100%)' : 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#90caf9' : '#9c27b0'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 500, mb: 2, color: '#6a1b9a' }}>
                  📝 Additional Notes
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  value={profileData.profile.remarks || ''}
                  placeholder="No remarks available"
                  InputProps={{
                    readOnly: true,
                    sx: {
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.23)'
                      }
                    }
                  }}
                />
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Card sx={{ p: 4, textAlign: 'center', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #2c2c2c 0%, #3c3c3c 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <Typography variant="h6" color="text.secondary">
              Profile details not available
            </Typography>
          </Card>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #2c2c2c 0%, #3c3c3c 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(Number(e.target.value))}
              label="Status"
            >
              {Array.isArray(statusOptions) && statusOptions.map((option, index) => (
                <MenuItem key={index} value={index + 1}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

      <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Are you sure you want to update the status?</Typography>
          <TextField
            label="Remarks"
            multiline
            rows={3}
            fullWidth
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add remarks for this status change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelStatusUpdate}>Cancel</Button>
          <Button onClick={confirmStatusUpdate} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={showCopySnackbar}
        autoHideDuration={2000}
        onClose={() => setShowCopySnackbar(false)}
        message={copyMessage}
      />
    </Dialog>
  );
};

export default ProfileDetailsDialog;