import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Grid, Card, Stack, Button, Avatar, CardContent, Chip } from '@mui/material';
import { Requirement } from '../../../models/Requirement';
import { CandidateStatus } from '../../../models/CandidateStatus';
import { apiService } from '../../../services/apiService';
import { candidateStatusService } from '../../../services/candidateStatusService';

interface ProfileDashboardProps {
  selectedRequirement: Requirement | null;
  onAddCandidate: () => void;
}

interface ProfileCounts {
  [key: string]: number;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ selectedRequirement, onAddCandidate }) => {
  const [candidateStatuses, setCandidateStatuses] = useState<CandidateStatus[]>([]);
  const [profileCounts, setProfileCounts] = useState<ProfileCounts>({});
  const [stages, setStages] = useState<string[]>([]);
  
  const fetchProfileCounts = async (requirementId: number) => {
    try {
      const endpoint = `${process.env.REACT_APP_REQUIREMENTS_GET_PROFILE_COUNTS_ENDPOINT}`.replace('{requirement_id}', requirementId.toString());
      const data = await apiService.get<ProfileCounts>(endpoint);
      setProfileCounts(data);
      console.log('Profile counts:', data);
    } catch (error) {
      console.error('Failed to fetch profile counts:', error);
    }
  };

  const loadCandidateStatuses = async () => {
    try {
      const data = await candidateStatusService.getCandidateStatuses();

      const actualData = Array.isArray(data) ? data : (data as any)?.data || [];
      setCandidateStatuses(actualData);
      const uniqueStages = Array.from(new Set(actualData.map((item: any) => item.stage))) as string[];
      setStages(uniqueStages);
    } catch (error) {
      console.error('Failed to load candidate statuses:', error);
      setCandidateStatuses([]);
    }
  };

  useEffect(() => {
    loadCandidateStatuses();
  }, []);

  useEffect(() => {
    if (selectedRequirement) {
      fetchProfileCounts(selectedRequirement.requirement_id);
    }
  }, [selectedRequirement]);

  useEffect(() => {
    const uniqueStages = Array.from(new Set(candidateStatuses.map(status => status.stage)));
    setStages(uniqueStages);
  }, [candidateStatuses]);
  if (!selectedRequirement) {
    return (
      <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
            📊 Profile Stage Dashboard
          </Typography>
          <Typography color="text.secondary" variant="h6">
            Select a requirement to view profile stages and candidate list
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
      <Box>
        <Box sx={{ p: 3, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
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
              👥 Candidate Profiles
            </Typography>
            <Button 
              variant="contained" 
              size="medium"
              onClick={onAddCandidate}
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
            {[1, 2, 3].map((profile) => (
              <Card key={profile} sx={{ 
                border: 0,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: 2,
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      P{profile}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Profile {profile}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        💼 Experience: {3 + profile} years
                      </Typography>
                      <Chip label="Screening" size="small" color="warning" sx={{ fontSize: '0.7rem' }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileDashboard;