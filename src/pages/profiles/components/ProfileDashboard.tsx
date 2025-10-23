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
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  
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
              console.error('Error fetching candidate for', item.profile_id, ':', error);
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
      console.error('Failed to fetch candidate counts:', error);
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

  useEffect(() => {
    const uniqueStages = Array.from(new Set(profileStatuses.map(status => status.stage)));
    setStages(uniqueStages);
  }, [profileStatuses]);
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
            {stages && stages.map((stage, index) => (
              <Grid item xs={12} sm={6} md={1.5} key={stage}>
                <Card onClick={() => setSelectedStage(selectedStage === stage ? null : stage)} sx={{ 
                  textAlign: 'center', 
                  p: 1.5,
                  height: 80,
                  minWidth: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${index < 3 ? ['#ff0080', '#8000ff', '#0080ff'][index] : index < 6 ? ['#ff8000', '#ffff00', '#80ff00'][index - 3] : ['#00ff80', '#ff4040'][index - 6]} 0%, ${index < 3 ? ['#ff4080', '#a040ff', '#4080ff'][index] : index < 6 ? ['#ffa040', '#ffff40', '#a0ff40'][index - 3] : ['#40ff80', '#ff6060'][index - 6]} 100%)`,
                  border: selectedStage === stage ? '3px solid #000' : 0,
                  boxShadow: selectedStage === stage ? 4 : 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.05)' }
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#000', textShadow: '0 1px 2px rgba(255,255,255,0.8)', fontSize: '1.5rem' }}>
                    {profileCounts[stage.toLowerCase()] || profileCounts[stage] || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#000', textShadow: '0 1px 1px rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                    {stage}
                  </Typography>
                </Card>
              </Grid>
            ))}
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
            ) : selectedStage && profileData.filter(profile => profile.stage === selectedStage).length === 0 ? (
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
              profileData.filter(profile => !selectedStage || profile.stage === selectedStage).map((profile) => (
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