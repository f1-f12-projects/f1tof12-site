import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Stack,
  Button
} from '@mui/material';
import { Company } from '../../models/Company';
import { Requirement } from '../../models/Requirement';
import { companyService } from '../../services/companyService';
import { requirementService } from '../../services/requirementService';
import { showAlert } from '../../utils/alert';
import PageHeader from '../../components/PageHeader';

const CompanyRequirements: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadRequirements();
    } else {
      setRequirements([]);
    }
  }, [selectedCompanyId]);

  const getTopCompanies = (companies: Company[]): Company[] => {
    // Dummy logic - will be replaced later
    return companies.slice(0, 3);
  };

  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies();
      if (response.success && response.data) {
        const activeCompanies = response.data.filter(company => company.status === 'active');
        setCompanies(getTopCompanies(activeCompanies));
      }
    } catch (error) {
      showAlert('Failed to load companies', 'error');
    }
  };

  const loadRequirements = async () => {
    setLoading(true);
    try {
      const response = await requirementService.getRequirements();
      if (response.success && response.data) {
        const openRequirements = response.data.filter(
          req => req.company_id === selectedCompanyId && req.status_id !== 4 // Assuming status_id 4 is closed
        );
        setRequirements(openRequirements);
      }
    } catch (error) {
      showAlert('Failed to load requirements', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <PageHeader title="Recruiter's Dashboard" />
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
            🏢 Companies
          </Typography>
          <Grid container spacing={3}>
            {companies.map((company) => (
              <Grid item xs={12} md={4} key={company.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: selectedCompanyId === company.id ? 2 : 0,
                    borderColor: 'primary.main',
                    background: selectedCompanyId === company.id 
                      ? 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' 
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: selectedCompanyId === company.id ? 4 : 2,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => setSelectedCompanyId(company.id)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: selectedCompanyId === company.id ? 'primary.main' : 'secondary.main',
                          width: 56, 
                          height: 56,
                          fontSize: '1.5rem',
                          fontWeight: 600
                        }}
                      >
                        {company.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {company.name}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {selectedCompanyId && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', height: '800px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Open Requirements
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                    {companies.find(c => c.id === selectedCompanyId)?.name}
                  </Typography>
                  <Chip 
                    label={requirements.length} 
                    sx={{ 
                      mt: 1, 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                </Box>
                <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
                  {loading ? (
                    <Typography sx={{ textAlign: 'center', py: 4 }}>Loading...</Typography>
                  ) : requirements.length > 0 ? (
                    <Stack spacing={1}>
                      {requirements.map((requirement) => (
                        <Card 
                          key={requirement.requirement_id}
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: selectedRequirement?.requirement_id === requirement.requirement_id ? 2 : 1,
                            borderColor: selectedRequirement?.requirement_id === requirement.requirement_id ? 'primary.main' : 'grey.200',
                            background: selectedRequirement?.requirement_id === requirement.requirement_id 
                              ? 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)'
                              : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => setSelectedRequirement(requirement)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {requirement.role}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {requirement.key_skill}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Chip 
                                    label={`📍 ${requirement.location || 'Not specified'}`} 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                                      color: 'primary.main',
                                      fontSize: '0.7rem'
                                    }} 
                                  />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Posted {(() => {
                                      const days = Math.floor((new Date().getTime() - new Date(requirement.created_date).getTime()) / (1000 * 60 * 60 * 24));
                                      if (days < 7) return `${days} days ago`;
                                      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
                                      return `${Math.floor(days / 30)} months ago`;
                                    })()}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography sx={{ color: 'text.secondary', fontSize: '1.2rem' }}>→</Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No open requirements found.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
                {selectedRequirement ? (
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
                        {['Screening', 'Interview', 'Offer', 'Dropped', 'Joined'].map((stage, index) => (
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
                                {Math.floor(Math.random() * 10)}
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
                ) : (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                      📊 Profile Stage Dashboard
                    </Typography>
                    <Typography color="text.secondary" variant="h6">
                      Select a requirement to view profile stages and candidate list
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default CompanyRequirements;