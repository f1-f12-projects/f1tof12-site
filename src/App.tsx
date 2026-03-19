import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CssBaseline, Container, Typography, CircularProgress } from '@mui/material';
import MaterialUIWrapper from './components/MaterialUIWrapper';
import { AuthProvider, useAuth } from './context/AuthContext';
import { roleHelper } from './utils/roleHelper';
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
import RequirementList from './pages/requirements/RequirementList';
import AddRequirement from './pages/requirements/AddRequirement';
import ProcessProfiles from './pages/profiles/ProcessProfiles';
import ProfileDashboard from './pages/reports/ProfileDashboard';
import Profile from './pages/Profile';
import Leaves from './pages/Leaves';

const PublicOnlyRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isInitializing, userRole } = useAuth();

  if (isInitializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated && userRole) {
    return <Navigate to={roleHelper.getDefaultRoute(userRole)} replace />;
  }

  return element;
};

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return element;
};

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

const publicRoutes: Record<string, React.ComponentType> = {
  '/': HomePage,
};

const protectedRoutes: Record<string, React.ComponentType> = {
  // User Routes
  '/profile': Profile,
  '/leaves': Leaves,

  // Company Routes
  '/company/register': RegisterCompany,
  '/company/list': CompanyList,
  '/company/spoc': SPOC,

  // Finance Related Routes
  '/company/invoices': InvoiceList,

  // Admin Routes
  '/admin/users': UserList,
  '/admin/users/create': CreateUser,
  '/reports/invoices': InvoiceReport,

  // Requirements Routes
  '/requirements': RequirementList,
  '/requirements/add': AddRequirement,

  // Profile Routes
  '/profiles': ProcessProfiles,
  '/reports/profiles': ProfileDashboard,
};

const comingSoonRoutes = [
  '/about', '/careers', '/contact', '/consulting', 
  '/development', '/support', '/privacy', '/terms'
];

const AppContent: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        {!isInitializing && isAuthenticated && <MegaBar />}
          
          <Box sx={{ flex: 1 }}>
            <Routes>
              {Object.entries(publicRoutes).map(([path, Component]) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
              <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
              {Object.entries(protectedRoutes).map(([path, Component]) => (
                <Route key={path} path={path} element={<ProtectedRoute element={<Component />} />} />
              ))}
              {comingSoonRoutes.map(path => (
                <Route key={path} path={path} element={<ComingSoon />} />
              ))}
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