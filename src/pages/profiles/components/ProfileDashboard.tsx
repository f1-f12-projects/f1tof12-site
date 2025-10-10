import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Grid, Card, Stack, Button, Avatar, CardContent, Chip, CircularProgress } from '@mui/material';
import { Requirement } from '../../../models/Requirement';
import { ProfileStatus } from '../../../models/ProfileStatus';
import { apiService } from '../../../services/apiService';
import { profileStatusService } from '../../../services/profileStatusService';
import { profileService } from '../../../services/profileService';
import { Profile } from '../../../models/Profile';
import ProfileDetailsDialog from './ProfileDetailsDialog';

interface ProfileDashboardProps {
  selectedRequirement: Requirement | null;
  onAddProfile: () => void;
}

interface ProfileCounts {
  screening?: number;
  interview?: number;
  offer?: number;
  dropped?: number;
  joined?: number;
  [key: string]: number | undefined;
}

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

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ selectedRequirement, onAddProfile }) => {
  const [profileStatuses, setProfileStatuses] = useState<ProfileStatus[]>([]);
  const [profileCounts, setProfileCounts] = useState<ProfileCounts>({});
  const [profileData, setProfileData] = useState<ProfileData[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  
  const fetchProfileCounts = async (requirementId: number) => {
    try {
      setLoading(true);
      // To fetch records from profile_profiles table
      const endpoint = `${process.env.REACT_APP_REQUIREMENTS_GET_PROFILE_COUNTS_ENDPOINT}`.replace('{requirement_id}', requirementId.toString());
      const response = await apiService.get<any>(endpoint);
      const data = Array.isArray(response) ? response : (response?.data || []);
      
      const statusIdToStage: Record<number, string> = {};
      profileStatuses.forEach(cs => {
        statusIdToStage[cs.id] = cs.stage;
      });
      
      const dataWithStage = data.map((item: any) => ({
        ...item,
        stage: statusIdToStage[item.status] || 'Unknown'
      }));
      
      const counts: ProfileCounts = {};
      dataWithStage.forEach((item: any) => {
        const stage = item.stage.toLowerCase();
        counts[stage] = (counts[stage] || 0) + 1;
      });
      setProfileCounts(counts);

      // Fetch profile information for items with profile_id
      const itemsWithProfiles = dataWithStage.filter((item: any) => item.profile_id);
      const itemsWithoutProfiles = dataWithStage.filter((item: any) => !item.profile_id);
      
      const profileResults = await Promise.allSettled(
        itemsWithProfiles.map((item: any) => {
          return profileService.getProfile(item.profile_id)
            .then(response => {
              return { item, profile: response.success ? response.data : null };
            })
            .catch(error => {
              console.error('Error fetching profile for', item.profile_id, ':', error);
              return { item, profile: null };
            });
        })
      );
      
      const profilesWithDetails = [
        ...itemsWithoutProfiles,
        ...profileResults.map((result, index) => ({
          ...itemsWithProfiles[index],
          profile: result.status === 'fulfilled' ? result.value.profile : null
        }))
      ];
      
      setProfileData(profilesWithDetails);

    } catch (error) {
      console.error('Failed to fetch profile counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileStatuses = async () => {
    try {
      const data = await profileStatusService.getProfileStatuses();

      const actualData = Array.isArray(data) ? data : ((data as any)?.data || []);
      setProfileStatuses(actualData);
      const uniqueStages = Array.from(new Set(actualData.map((item: any) => item.stage))) as string[];
      setStages(uniqueStages);
    } catch (error) {
      console.error('Failed to load profile statuses:', error);
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

  useEffect(() => {
    const uniqueStages = Array.from(new Set(profileStatuses.map(status => status.stage)));
    setStages(uniqueStages);
  }, [profileStatuses]);
  if (!selectedRequirement) {
    return (
      <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #2c2c2c 0%, #3c3c3c 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            📊 Profile Stage Dashboard
          </Typography>
          <Typography color="text.secondary" variant="h6">
            Select a requirement to view profile stages and profile list
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
            📊 Profile Stage Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            {selectedRequirement.key_skill} - {selectedRequirement.location}
          </Typography>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {stages && stages.map((stage, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={stage}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  background: `linear-gradient(135deg, ${['#301378ff', '#87ceeb', '#90ee90', '#9e9e9e', '#10b981'][index]} 0%, ${['#24058bff', '#4682b4', '#32cd32', '#757575', '#059669'][index]} 100%)`,
                  border: 0,
                  boxShadow: 2,
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.05)' }
                }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    {profileCounts[stage.toLowerCase()] || profileCounts[stage] || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {stage}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              👥 Profile Entries
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
              + Add Profile
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
                  📋 No Profiles Assigned
                </Typography>
              </Card>
            ) : (
              profileData.map((profile) => (
                <Card 
                  key={profile.id} 
                  onDoubleClick={() => setSelectedProfile(profile)}
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
                        P{profile.id}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {profile.profile?.name || `Profile ${profile.id}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📧 {profile.profile?.email || 'Email not available'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          👤 Recruiter: {profile.recruiter_name || 'Not assigned'}
                        </Typography>
                        <Chip label={profile.stage} size="small" color="primary" sx={{ fontSize: '0.7rem' }} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Box>
      </Box>
      
      <ProfileDetailsDialog
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        profileData={selectedProfile}
      />
    </Paper>
  );
};

export default ProfileDashboard;