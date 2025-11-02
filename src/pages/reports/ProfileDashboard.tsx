import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { profileService } from '../../services/profileService';
import { profileStatusService } from '../../services/profileStatusService';
import { Profile } from '../../models/Profile';

interface WeeklyData {
  week: string;
  total: number;
  statusCounts: Record<string, number>;
}

const ProfileDashboard: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profilesResponse, statuses] = await Promise.all([
          profileService.getProfiles(),
          profileStatusService.getProfileStatuses()
        ]);

        if (profilesResponse.success && profilesResponse.data) {
          const profiles = profilesResponse.data;
          const statusMap = statuses.reduce((map, status) => {
            map[status.id] = status.status;
            return map;
          }, {} as Record<number, string>);

          const weeklyMap = new Map<string, { total: number; statusCounts: Record<string, number> }>();

          profiles.forEach((profile: Profile) => {
            if (profile.created_date) {
              const date = new Date(profile.created_date);
              const weekStart = new Date(date);
              weekStart.setDate(date.getDate() - date.getDay());
              const weekKey = weekStart.toISOString().split('T')[0];

              if (!weeklyMap.has(weekKey)) {
                weeklyMap.set(weekKey, { total: 0, statusCounts: {} });
              }

              const weekData = weeklyMap.get(weekKey)!;
              weekData.total++;

              const status = statusMap[profile.status || 1] || 'Unknown';
              weekData.statusCounts[status] = (weekData.statusCounts[status] || 0) + 1;
            }
          });

          const sortedWeekly = Array.from(weeklyMap.entries())
            .map(([week, data]) => ({ week, ...data }))
            .sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime())
            .slice(0, 8);

          setWeeklyData(sortedWeekly);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profile Creation Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {weeklyData.map((week) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={week.week}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Week of {new Date(week.week).toLocaleDateString()}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {week.total}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Profiles
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  {Object.entries(week.statusCounts).map(([status, count]) => (
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
    </Box>
  );
};

export default ProfileDashboard;