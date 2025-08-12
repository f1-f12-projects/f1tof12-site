import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Container, Typography } from '@mui/material';
import MaterialUIWrapper from './components/MaterialUIWrapper';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import MegaBar from './components/MegaBar';
import Carousel from './components/Carousel';
import Footer from './components/Footer';
import RegisterCompany from './pages/company/RegisterCompany';
import CompanyList from './pages/company/CompanyList';
import Login from './pages/Login';

const HomePage: React.FC = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Carousel />
    <Box sx={{ mt: 6, textAlign: 'center' }}>
      <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
        Your trusted partner for innovative solutions and exceptional service delivery
      </Typography>
    </Box>
  </Container>
);

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        {isAuthenticated && <MegaBar />}
          
          <Box sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/company/register" element={<RegisterCompany />} />
              <Route path="/company/list" element={<CompanyList />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Box>
          
          <Footer />
      </Box>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <MaterialUIWrapper>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </MaterialUIWrapper>
  );
};

export default App;