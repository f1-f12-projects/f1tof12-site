import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Badge,
  CalendarToday,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { User } from '../models/User';
import { alert } from '../utils/alert';

const Profile: React.FC = () => {
  const { username } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;
      
      try {
        const userDetails = await userService.getUserDetails(username);
        setUser(userDetails);
      } catch (error) {
        alert.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Profile not found
        </Typography>
      </Container>
    );
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user.username.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              mr: 3
            }}
          >
            {getInitials(user.given_name, user.family_name)}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {user.given_name && user.family_name
                ? `${user.given_name} ${user.family_name}`
                : user.username}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Profile Details */}
        <Card variant="outlined">
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
              Contact Information
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.username}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.phone_number}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Badge sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.role || 'Not assigned'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};

export default Profile;