import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Button, Autocomplete, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { profileService } from '../../services/profileService';
import { profileStatusService } from '../../services/profileStatusService';
import DateRangeFilter, { DateRange } from '../../components/DateRangeFilter';

interface GroupedData {
  key: string;
  title: string;
  total: number;
  statusCounts: Record<string, number>;
}

const ProfileDashboard: React.FC = () => {
  const theme = useTheme();
  const [allGroupedData, setAllGroupedData] = useState<GroupedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedRecruiters, setSelectedRecruiters] = useState<string[]>([]);
  
  const fetchData = useCallback(async () => {
    if (!dateRange) return;
    
    setLoading(true);
    try {
      const fromDate = new Date(dateRange.from.getTime() - dateRange.from.getTimezoneOffset() * 60000);
      const toDate = new Date(dateRange.to.getTime() - dateRange.to.getTimezoneOffset() * 60000);
      
      const [profilesResponse, statuses] = await Promise.all([
        profileService.getProfilesByDateRange(
          fromDate.toISOString().split('T')[0],
          toDate.toISOString().split('T')[0]
        ),
        profileStatusService.getProfileStatuses()
      ]);

      if (profilesResponse.success && profilesResponse.data) {
        const statusMap = statuses.reduce((map, status) => {
          map[status.id] = `${status.stage} | ${status.status}`;
          return map;
        }, {} as Record<number, string>);

        const groupedMap = new Map<string, { total: number; statusCounts: Record<string, number> }>();

        profilesResponse.data.forEach((profile: any) => {
          const companyKey = `${profile.company_name || 'No Company'} - ${profile.recruiter_name || 'Unknown'}`;
          
          if (!groupedMap.has(companyKey)) {
            groupedMap.set(companyKey, { total: 0, statusCounts: {} });
          }

          const groupData = groupedMap.get(companyKey)!;
          groupData.total++;

          const status = statusMap[profile.status] || 'Unknown';
          groupData.statusCounts[status] = (groupData.statusCounts[status] || 0) + 1;
        });

        const sortedGroups = Array.from(groupedMap.entries())
          .map(([key, data]) => ({ key, title: key, ...data }))
          .sort((a, b) => b.total - a.total);

        setAllGroupedData(sortedGroups);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const { availableCompanies, availableRecruiters, groupedData } = useMemo(() => {
    const companies = new Set<string>();
    const recruiters = new Set<string>();
    
    allGroupedData.forEach(group => {
      const [companyName, recruiterName = 'Unknown'] = group.title.split(' - ');
      companies.add(companyName);
      recruiters.add(recruiterName);
    });

    let filtered = allGroupedData;
    if (selectedCompanies.length > 0) {
      filtered = filtered.filter(group => selectedCompanies.includes(group.title.split(' - ')[0]));
    }
    if (selectedRecruiters.length > 0) {
      filtered = filtered.filter(group => selectedRecruiters.includes(group.title.split(' - ')[1] || 'Unknown'));
    }

    return {
      availableCompanies: Array.from(companies).sort(),
      availableRecruiters: Array.from(recruiters).sort(),
      groupedData: filtered
    };
  }, [allGroupedData, selectedCompanies, selectedRecruiters]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        mb: 4,
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 3,
        boxShadow: theme.shadows[2]
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            color: theme.palette.primary.main
          }}>
            📊 Profile Creation Dashboard
          </Typography>
          <Button 
            variant="contained"
            onClick={fetchData}
            disabled={loading}
            sx={{ 
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              py: 1.5,
              color: 'white',
              boxShadow: theme.shadows[4],
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Refresh
          </Button>
        </Box>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box sx={{ 
              p: 2,
              backgroundColor: theme.palette.action.hover,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              position: 'relative',
              zIndex: 1000,
              overflow: 'visible'
            }}>
              <Typography variant="h6" sx={{ 
                mb: 1, 
                fontWeight: 800,
                color: theme.palette.primary.main,
                fontSize: '1.2rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                📅 Date Range
              </Typography>
              <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ 
              p: 2,
              backgroundColor: theme.palette.action.hover,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" sx={{ 
                mb: 1, 
                fontWeight: 800,
                color: theme.palette.primary.main,
                fontSize: '1.2rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                🏢 Company Filter
              </Typography>
              <Autocomplete
                multiple
                options={availableCompanies}
                value={selectedCompanies}
                onChange={(_, newValue) => setSelectedCompanies(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Select companies" 
                    variant="outlined"
                  />
                )}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ 
              p: 2,
              backgroundColor: theme.palette.action.hover,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" sx={{ 
                mb: 1, 
                fontWeight: 800,
                color: theme.palette.primary.main,
                fontSize: '1.2rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                👤 Recruiter Filter
              </Typography>
              <Autocomplete
                multiple
                options={availableRecruiters}
                value={selectedRecruiters}
                onChange={(_, newValue) => setSelectedRecruiters(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Select recruiters" 
                    variant="outlined"
                  />
                )}
              />
            </Box>
          </Grid>
          

        </Grid>
      </Box>
      {loading || !dateRange ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : groupedData.length === 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
          <Typography variant="h5" sx={{ mb: 2, color: theme.palette.text.secondary }}>
            📭 No Records Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No profiles found for the selected date range, company, and recruiter filters.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {groupedData.map((group) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={group.key}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                border: `2px solid ${theme.palette.grey[400]}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: theme.shadows[12]
                },
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  backgroundColor: theme.palette.grey[800],
                  color: theme.palette.common.white,
                  p: 2,
                  textAlign: 'center'
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 800,
                      fontSize: '1.3rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {group.title.split(' - ')[0]}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {group.total}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ 
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    letterSpacing: '0.3px'
                  }}>
                    👤 {group.title.split(' - ')[1] || 'Unknown'}
                  </Typography>
                </Box>
                <CardContent sx={{ 
                  p: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'calc(100% - 80px)',
                  '&:last-child': { pb: 0 }
                }}>
                  <Box sx={{ 
                    mx: 3,
                    mt: 3,
                    mb: 3,
                    p: 1.5,
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    {Object.entries(group.statusCounts).map(([status, count], index) => (
                      <Box key={status} display="flex" justifyContent="space-between" sx={{
                        mb: index < Object.entries(group.statusCounts).length - 1 ? 0.5 : 0
                      }}>
                        <Typography variant="body2" color="text.secondary">{status}:</Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600,
                          color: theme.palette.secondary.main
                        }}>{count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProfileDashboard;