import React from 'react';
import { Box, Typography, Link, Grid } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4, mt: 'auto', px: 4 }}>
      <Grid container spacing={4}>
          <Grid item xs={12} sm={3}>
            <Typography variant="h6" gutterBottom>
              Company
            </Typography>
            <Link href="#" color="inherit" underline="hover" display="block">About Us</Link>
            <Link href="#" color="inherit" underline="hover" display="block">Careers</Link>
            <Link href="#" color="inherit" underline="hover" display="block">Contact</Link>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h6" gutterBottom>
              Services
            </Typography>
            <Link href="#" color="inherit" underline="hover" display="block">Consulting</Link>
            <Link href="#" color="inherit" underline="hover" display="block">Development</Link>
            <Link href="#" color="inherit" underline="hover" display="block">Support</Link>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Link href="#" color="inherit" underline="hover" display="block">Privacy Policy</Link>
            <Link href="#" color="inherit" underline="hover" display="block">Terms of Service</Link>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h6" gutterBottom>
              Connect
            </Typography>
            <Link href="#" color="inherit" underline="hover" display="block">LinkedIn</Link>
            <Link href="#" color="inherit" underline="hover" display="block">Twitter</Link>
          </Grid>
      </Grid>
      <Box sx={{ borderTop: 1, borderColor: 'grey.700', mt: 4, pt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          © 2024 F1toF12. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;