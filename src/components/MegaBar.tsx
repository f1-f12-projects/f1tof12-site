import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemText, Collapse, Drawer, IconButton } from '@mui/material';
import { ExpandLess, ExpandMore, Business, BusinessCenter, Person, Assessment, AccountBalance, AdminPanelSettings, Menu } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { roleHelper } from '../utils/roleHelper';

const MegaBar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const handleNavigate = (path: string) => {
    navigate(path);
    setCompanyOpen(false);
    setAdminOpen(false);
    setReportsOpen(false);
    setSidebarOpen(false);
  };
  
  const visibleMenuItems = useMemo(() => 
    userRole ? roleHelper.getVisibleMenuItems(userRole) : [], 
    [userRole]
  );

  const drawerWidth = 240;

  const menuItems = useMemo(() => ({
    admin: [
      { label: 'Manage Users', path: '/admin/users' },
      { label: 'Register New Company', path: '/company/register' },
      { label: 'Show Companies', path: '/company/list' },
      { label: 'Manage SPOC', path: '/company/spoc' }
    ],
    reports: [
      { label: 'Invoice', path: '/reports/invoices' },
      { label: 'Profile Dashboard', path: '/reports/profiles' }
    ],
    main: [
      { label: 'Requirements', path: '/requirements', icon: <BusinessCenter /> },
      { label: 'Candidate', path: '/profiles', icon: <Person /> },
      { label: 'Reports', path: '/reports', icon: <Assessment /> },
      { label: 'Finance', path: '/company/invoices', icon: <AccountBalance /> },
      { label: 'Admin', path: '/admin/users', icon: <AccountBalance /> }
    ]
  }), []);



  return (
    <>
      <IconButton
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          position: 'fixed',
          top: 80,
          left: 16,
          zIndex: 1300,
          bgcolor: 'background.paper',
          boxShadow: 2
        }}
      >
        <Menu />
      </IconButton>
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            marginTop: '64px'
          }
        }}
      >
      <List sx={{ pt: 2 }}>
        {menuItems.main.map(({ label, path, icon }) => 
          visibleMenuItems.includes(path) && (
            label === 'Reports' ? (
              <React.Fragment key={path}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => setReportsOpen(!reportsOpen)}>
                    {icon}
                    <ListItemText primary={label} sx={{ ml: 2 }} />
                    {reportsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {menuItems.reports.map(({ label, path }) => (
                      <ListItem key={path} disablePadding>
                        <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigate(path)}>
                          <ListItemText primary={label} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
              <ListItem key={path} disablePadding>
                <ListItemButton onClick={() => handleNavigate(path)}>
                  {icon}
                  <ListItemText primary={label} sx={{ ml: 2 }} />
                </ListItemButton>
              </ListItem>
            )
          )
        )}
        
        {visibleMenuItems.includes('/admin') && (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setAdminOpen(!adminOpen)}>
                <AdminPanelSettings sx={{ mr: 2 }} />
                <ListItemText primary="Admin" />
                {adminOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {menuItems.admin.map(({ label, path }) => (
                  <ListItem key={path} disablePadding>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigate(path)}>
                      <ListItemText primary={label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </List>
    </Drawer>
    </>
  );
};

export default MegaBar;