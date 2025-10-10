import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, Card, Chip, Avatar, Divider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Profile } from '../../../models/Profile';
import { profileStatusService } from '../../../services/profileStatusService';
import { ProfileStatus } from '../../../models/ProfileStatus';

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
    if (profileData?.status) {
      setSelectedStatus(profileData.status);
    }
  }, [profileData?.status]);

  useEffect(() => {
    const loadStatusText = async () => {
      if (profileData?.status) {
        try {
          const status = await profileStatusService.getStatusById(profileData.status);
          setStatusText(status || '');
        } catch (error) {
          console.error('Error loading status:', error);
          setStatusText('');
        }
      }
    };
    loadStatusText();
  }, [profileData?.status]);
  
  if (!profileData) return null;

  const handleStatusChange = (newStatus: number) => {
    if (newStatus !== profileData.status) {
      setSelectedStatus(newStatus);
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        fontWeight: 700,
        fontSize: '1.5rem',
      }}>
        <Box>
          👤 {profileData.profile?.name || `Profile ${profileData.id}`}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Recruiter: {profileData.recruiter_name || 'Not assigned'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, marginLeft: 'auto' }}>
              <Chip 
                label={statusText || profileData.status} 
                color="primary" 
                sx={{ fontSize: '0.9rem', fontWeight: 600 }} 
              />

              <Chip 
                label={profileData.stage} 
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
                  { label: 'Email', value: profileData.profile.email },
                  { label: 'Phone', value: profileData.profile.phone }
                ]
              },
              {
                title: '🎯 Professional Details',
                items: [
                  { label: 'Experience', value: `${profileData.profile.experience_years} years` },
                  { label: 'Skills', value: profileData.profile.skills }
                ]
              },
              {
                title: '📍 Location Preferences',
                items: [
                  { label: 'Current', value: profileData.profile.current_location },
                  { label: 'Preferred', value: profileData.profile.preferred_location }
                ]
              },
              {
                title: '💰 Compensation & Availability',
                items: [
                  { label: 'Current CTC', value: profileData.profile.current_ctc || 'Not specified' },
                  { label: 'Expected CTC', value: profileData.profile.expected_ctc || 'Not specified' },
                  { label: 'Notice Period', value: profileData.profile.notice_period || 'Not specified' }
                ]
              }
            ].map((section, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ p: 2, height: 180, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', boxShadow: 1, ...((index === 0 || index === 1) && { mt: 2 }) }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                    {section.title}
                  </Typography>
                  {section.items.map((item, itemIndex) => (
                    <Typography key={itemIndex} sx={{ mb: itemIndex < section.items.length - 1 ? 1 : 0 }}>
                      <strong>{item.label}:</strong> {item.value}
                    </Typography>
                  ))}
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <Typography variant="h6" color="text.secondary">
              Profile details not available
            </Typography>
          </Card>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', justifyContent: 'space-between' }}>
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
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
            px: 4
          }}
        >
          Close
        </Button>
      </DialogActions>

      <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to update the status?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelStatusUpdate}>Cancel</Button>
          <Button onClick={confirmStatusUpdate} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ProfileDetailsDialog;