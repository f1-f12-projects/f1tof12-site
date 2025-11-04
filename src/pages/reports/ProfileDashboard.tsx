import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Button } from '@mui/material';
import { profileService } from '../../services/profileService';
import { profileStatusService } from '../../services/profileStatusService';
import { Profile } from '../../models/Profile';
import DateRangeFilter, { DateRange } from '../../components/DateRangeFilter';

interface GroupedData {
  key: string;
  title: string;
  total: number;
  statusCounts: Record<string, number>;
}

const ProfileDashboard: React.FC = () => {
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  
  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!dateRange) return;
    
    const fetchData = async () => {
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
          const profiles = profilesResponse.data;
          const statusMap = statuses.reduce((map, status) => {
            map[status.id] = `${status.stage} | ${status.status}`;
            return map;
          }, {} as Record<number, string>);

          const groupedMap = new Map<string, { total: number; statusCounts: Record<string, number> }>();

          profiles.forEach((profile: any) => {
            const recruiterKey = profile.recruiter_name || 'Unknown';
            
            if (!groupedMap.has(recruiterKey)) {
              groupedMap.set(recruiterKey, { total: 0, statusCounts: {} });
            }

            const groupData = groupedMap.get(recruiterKey)!;
            groupData.total++;

            const status = statusMap[profile.status] || 'Unknown';
            groupData.statusCounts[status] = (groupData.statusCounts[status] || 0) + 1;
          });

          const sortedGroups = Array.from(groupedMap.entries())
            .map(([key, data]) => ({ key, title: key, ...data }))
            .sort((a, b) => b.total - a.total);

          setGroupedData(sortedGroups);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profile Creation Dashboard
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
        <Button variant="outlined" onClick={handleRefresh}>
          Refresh
        </Button>
      </Box>
      
      {loading || !dateRange ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {groupedData.map((group) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={group.key}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>
                    {group.title}
                  </Typography>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {group.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Profiles
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(group.statusCounts).map(([status, count]) => (
                      <Box key={status} display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{status}:</Typography>
                        <Typography variant="body2" fontWeight="bold">{count}</Typography>
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