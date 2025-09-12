import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Container, Typography } from '@mui/material';
import MaterialUIWrapper from './components/MaterialUIWrapper';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './utils/alert';
import { ConfirmProvider } from './utils/confirm';
import Header from './components/Header';
import MegaBar from './components/MegaBar';
import Carousel from './components/Carousel';
import Footer from './components/Footer';
import RegisterCompany from './pages/company/RegisterCompany';
import CompanyList from './pages/company/CompanyList';
import SPOC from './pages/company/SPOC';
import InvoiceList from './pages/company/InvoiceList';
import UserList from './pages/admin/UserList';
import CreateUser from './pages/admin/CreateUser';
import Login from './pages/Login';
import ComingSoon from './pages/ComingSoon';
import PageNotFound from './pages/PageNotFound';
import InvoiceReport from './pages/reports/InvoiceReport';

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
              <Route path="/company/spoc" element={<SPOC />} />
              <Route path="/company/invoices" element={<InvoiceList />} />
              <Route path="/admin/users" element={<UserList />} />
              <Route path="/admin/users/create" element={<CreateUser />} />
              <Route path="/login" element={<Login />} />
              <Route path="/recruiter" element={<ComingSoon />} />
              <Route path="/profiles" element={<ComingSoon />} />
              <Route path="/reports" element={<ComingSoon />} />
              <Route path="/reports/invoices" element={<InvoiceReport />} />
              <Route path="/about" element={<ComingSoon />} />
              <Route path="/careers" element={<ComingSoon />} />
              <Route path="/contact" element={<ComingSoon />} />
              <Route path="/consulting" element={<ComingSoon />} />
              <Route path="/development" element={<ComingSoon />} />
              <Route path="/support" element={<ComingSoon />} />
              <Route path="/privacy" element={<ComingSoon />} />
              <Route path="/terms" element={<ComingSoon />} />
              <Route path="*" element={<PageNotFound />} />
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
      <ConfirmProvider>
        <AlertProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </AlertProvider>
      </ConfirmProvider>
    </MaterialUIWrapper>
  );
};

export default App;