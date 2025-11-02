import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Grid, Card, Stack, Button, Avatar, CardContent, Chip, CircularProgress } from '@mui/material';
import { Requirement } from '../../../models/Requirement';
import { ProfileStatus } from '../../../models/ProfileStatus';
import { profileStatusService } from '../../../services/profileStatusService';
import { requirementService } from '../../../services/requirementService';
import { Profile } from '../../../models/Profile';
import ProfileDetailsDialog from './ProfileDetailsDialog';

interface ProfileDashboardProps {
  selectedRequirement: Requirement | null;
  onAddProfile: () => void;
}

interface ProfileData extends Profile {
  stage: string;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ selectedRequirement, onAddProfile }) => {
  const [profileStatuses, setProfileStatuses] = useState<ProfileStatus[]>([]);
  const [profileCounts, setProfileCounts] = useState<Record<string, number>>({});
  const [profileData, setProfileData] = useState<ProfileData[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  
  const fetchProfileCounts = async (requirementId: number) => {
    try {
      setLoading(true);
      // To fetch records from profile_profiles table
      const response = await requirementService.getProfileCounts(requirementId);
      
      if (response.success && response.data) {
        setProfileCounts(response.data);
      }

    } catch (error) {
      console.error('Failed to fetch candidate counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfilesByStage = async (requirementId: number, stage: string) => {
    try {
      setLoading(true);
      const response = await requirementService.getProfilesByStage(requirementId, stage);
      
      if (response.success && response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch profiles by stage:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileStatuses = async () => {
    try {
      const data = await profileStatusService.getProfileStatuses();

      const actualData = Array.isArray(data) ? data : ((data as any)?.data || []);
      setProfileStatuses(actualData);
      const stagesWithIds = await profileStatusService.getStagesWithIds();
      const sortedStages = stagesWithIds.map(item => item.stage);
      setStages(sortedStages);
    } catch (error) {
      console.error('Failed to load candidate statuses:', error);
      setProfileStatuses([]);
    }
  };

  useEffect(() => {
    loadProfileStatuses();
  }, []);

  useEffect(() => {
    if (selectedRequirement && profileStatuses.length > 0) {
      fetchProfileCounts(selectedRequirement.requirement_id);
    }
  }, [selectedRequirement, profileStatuses]);

  if (!selectedRequirement) {
    return (
      <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #2c2c2c 0%, #3c3c3c 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            📊 Candidate Stage Dashboard
          </Typography>
          <Typography color="text.secondary" variant="h6">
            Select a requirement to view candidate stages and candidate list
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
      <Box>
        <Box sx={{ p: 3, background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            📊 Candidate Stage Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            {selectedRequirement.key_skill} - {selectedRequirement.location}
          </Typography>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {stages && stages.map((stage, index) => {
              const count = profileCounts[stage] || 0;
              const isDisabled = count === 0;
              
              return (
                <Grid item xs={12} sm={6} md={3} lg={2} xl={1.5} key={stage}>
                  <Card onClick={isDisabled ? undefined : () => {
                    const newStage = selectedStage === stage ? null : stage;
                    setSelectedStage(newStage);
                    if (newStage && selectedRequirement) {
                      loadProfilesByStage(selectedRequirement.requirement_id, newStage);
                    } else {
                      setProfileData([]);
                    }
                  }} sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  height: 90,
                  minWidth: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  background: isDisabled 
                    ? 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 100%)'
                    : selectedStage === stage 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : `linear-gradient(135deg, ${[
                          'rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.1)',
                          'rgba(16, 185, 129, 0.1)', 'rgba(245, 158, 11, 0.1)', 'rgba(239, 68, 68, 0.1)',
                          'rgba(168, 85, 247, 0.1)', 'rgba(34, 197, 94, 0.1)'
                        ][index % 8]} 0%, rgba(255, 255, 255, 0.8) 100%)`,
                  border: isDisabled 
                    ? '1px solid rgba(0,0,0,0.05)'
                    : selectedStage === stage ? '2px solid #667eea' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 2,
                  boxShadow: isDisabled 
                    ? 'none'
                    : selectedStage === stage ? '0 8px 25px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                  zIndex: selectedStage === stage ? 10 : 1,
                  '&:hover': !isDisabled ? { 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                    zIndex: 20,
                    background: selectedStage === stage 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : `linear-gradient(135deg, ${[
                          'rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(59, 130, 246, 0.2)',
                          'rgba(16, 185, 129, 0.2)', 'rgba(245, 158, 11, 0.2)', 'rgba(239, 68, 68, 0.2)',
                          'rgba(168, 85, 247, 0.2)', 'rgba(34, 197, 94, 0.2)'
                        ][index % 8]} 0%, rgba(255, 255, 255, 0.9) 100%)`
                  } : {}
                }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: isDisabled 
                        ? 'rgba(0,0,0,0.3)'
                        : selectedStage === stage ? '#fff' : 'primary.main',
                      fontSize: '1.8rem',
                      mb: 0.5
                    }}>
                      {count}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      color: isDisabled 
                        ? 'rgba(0,0,0,0.3)'
                        : selectedStage === stage ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                      fontSize: '0.8rem',
                      textTransform: 'capitalize'
                    }}>
                      {stage}
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              👥 {selectedStage ? `${selectedStage} Candidates` : 'Candidate Entries'}
            </Typography>
            <Button 
              variant="contained" 
              size="medium"
              onClick={onAddProfile}
              sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
                fontSize: '1rem',
                px: 3,
                py: 1
              }}
            >
              + Add Candidate
            </Button>
          </Stack>
          <Stack spacing={2}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : profileData.length === 0 ? (
              <Card sx={{ 
                textAlign: 'center', 
                p: 4,
                background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #2c2c2c 0%, #3c3c3c 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                border: '2px dashed #e0e0e0',
                borderRadius: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  📋 No Candidates Assigned
                </Typography>
              </Card>
            ) : selectedStage && profileData.filter(profile => {
              return profile.stage === selectedStage;
            }).length === 0 ? (
              <Card sx={{ 
                textAlign: 'center', 
                p: 4,
                background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #2c2c2c 0%, #3c3c3c 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                border: '2px dashed #e0e0e0',
                borderRadius: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  📋 No Candidates in {selectedStage} Stage
                </Typography>
              </Card>
            ) : (
              profileData.filter(profile => {
                if (!selectedStage) return true;
                return profile.stage === selectedStage;
              }).map((profile) => (
                <Card 
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  sx={{ 
                    border: 0,
                    borderRadius: 2,
                    background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #2c2c2c 0%, #3c3c3c 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: 2,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                  }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        {profile.name?.charAt(0) || 'P'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {profile.name || `Profile ${profile.id}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📧 {profile.email || 'Email not available'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📞 {profile.phone || 'Phone not available'}
                        </Typography>
                        <Chip label={profileStatuses.find(ps => ps.id === profile.status)?.status || 'Unknown'} size="small" color="primary" sx={{ fontSize: '0.7rem' }} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Box>
      </Box>

      {selectedProfile && (
        <ProfileDetailsDialog
          open={!!selectedProfile}
          onClose={() => {
            setSelectedProfile(null);
            if (selectedRequirement) {
              fetchProfileCounts(selectedRequirement.requirement_id);
            }
          }}
          profileData={{
            profile_id: selectedProfile.id || null,
            id: selectedProfile.id || 0,
            recruiter_name: 'N/A',
            remarks: selectedProfile.remarks || '',
            requirement_id: selectedRequirement?.requirement_id || 0,
            status_id: selectedProfile.status || 0,
            profile: selectedProfile
          }}
          onStatusUpdate={() => {
            if (selectedRequirement) {
              fetchProfileCounts(selectedRequirement.requirement_id);
            }
          }}
        />
      )}
    </Paper>
  );
};

export default ProfileDashboard;