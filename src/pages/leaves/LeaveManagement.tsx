import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Button, Stack, Card, CardContent, Grid, Chip } from '@mui/material';
import { Add, Assignment, AccountBalance, Person, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { leaveService, Leave, LeaveDashboard, PendingLeave } from '../../services/leaveService';
import { alert } from '../../utils/alert';
import LeaveStats from './components/LeaveStats';
import LeaveTable from './components/LeaveTable';
import LeaveBalance from './components/LeaveBalance';
import LeaveBalanceTable from './components/LeaveBalanceTable';
import ApplyLeaveDialog from './components/ApplyLeaveDialog';
import AllocateLeaveDialog from './components/AllocateLeaveDialog';

const LeaveManagement: React.FC = () => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<LeaveDashboard | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);
  const [applyForm, setApplyForm] = useState({
    start_date: '',
    end_date: '',
    leave_type: 'sick',
    reason: ''
  });
  const [allocateForm, setAllocateForm] = useState({
    username: '',
    annual_leave: 0,
    sick_leave: 0,
    casual_leave: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [refreshBalanceTable, setRefreshBalanceTable] = useState(0);
  const isHR = userRole === 'hr';
  const isManager = userRole === 'manager';
  const [activeTab, setActiveTab] = useState(isHR || isManager ? 1 : 0);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getLeaveDashboard();
      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (error: any) {
      alert.error(error?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApplyLeave = async () => {
    if (!applyForm.start_date || !applyForm.end_date || !applyForm.reason.trim()) {
      alert.error('All fields are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await leaveService.applyLeave(applyForm);
      if (response.success) {
        alert.success('Leave application submitted successfully');
        setShowApplyDialog(false);
        setApplyForm({ start_date: '', end_date: '', leave_type: 'sick', reason: '' });
        await loadDashboard();
      }
    } catch (error: any) {
      alert.error(error?.message || 'Failed to apply for leave');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveAction = async (leaveId: number, action: 'approve' | 'reject') => {
    try {
      const response = await leaveService.approveRejectLeave(leaveId, action);
      if (response.success) {
        alert.success(`Leave ${action}d successfully`);
        await loadDashboard();
      }
    } catch (error: any) {
      alert.error(error?.message || `Failed to ${action} leave`);
    }
  };

  const handleAllocateLeave = async () => {
    if (!allocateForm.username.trim()) {
      alert.error('Username is required');
      return;
    }

    const leaveBalances: any = {};
    if (allocateForm.annual_leave) leaveBalances.annual_leave = allocateForm.annual_leave;
    if (allocateForm.sick_leave) leaveBalances.sick_leave = allocateForm.sick_leave;
    if (allocateForm.casual_leave) leaveBalances.casual_leave = allocateForm.casual_leave;

    if (Object.keys(leaveBalances).length === 0) {
      alert.error('At least one leave balance must be specified');
      return;
    }

    setSubmitting(true);
    try {
      const response = await leaveService.allocateLeaveBalance(allocateForm.username, leaveBalances);
      if (response.success) {
        alert.success('Leave balance allocated successfully');
        setShowAllocateDialog(false);
        setAllocateForm({ username: '', annual_leave: 0, sick_leave: 0, casual_leave: 0 });
        setRefreshBalanceTable(prev => prev + 1);
      }
    } catch (error: any) {
      alert.error(error?.message || 'Failed to allocate leave balance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyFormChange = (field: string, value: string) => {
    setApplyForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAllocateFormChange = (field: string, value: string) => {
    const numericFields = ['annual_leave', 'sick_leave', 'casual_leave'];
    const processedValue = numericFields.includes(field) ? Number(value) || 0 : value;
    setAllocateForm(prev => ({ ...prev, [field]: processedValue }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // My Leaves Tab
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">My Leave Dashboard</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowApplyDialog(true)}
              >
                Apply Leave
              </Button>
            </Box>
            <LeaveBalance balance={loading ? undefined : dashboard?.balance} />
            <LeaveStats isHR={false} leaves={dashboard?.leaves} />
            <LeaveTable isHR={false} onLeaveAction={handleLeaveAction} leaves={dashboard?.leaves} />
          </Box>
        );
      case 1: // Approval Tab
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>Leave Approvals</Typography>
            <LeaveStats isHR={true} leaves={dashboard?.leaves} />
            <LeaveTable isHR={true} onLeaveAction={handleLeaveAction} leaves={dashboard?.leaves} />
          </Box>
        );
      case 2: // Allocation Tab (HR only)
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Employee Leave Balances</Typography>
              <Button
                variant="contained"
                startIcon={<Assignment />}
                onClick={() => setShowAllocateDialog(true)}
              >
                Allocate Leave
              </Button>
            </Box>
            <LeaveBalanceTable key={refreshBalanceTable} />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Leave Management
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={(isHR || isManager) ? 4 : 12}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: activeTab === 0 ? '2px solid' : '1px solid',
                borderColor: activeTab === 0 ? 'success.main' : 'divider',
                bgcolor: activeTab === 0 ? 'success.light' : 'background.paper',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
              onClick={() => setActiveTab(0)}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Person 
                  sx={{ 
                    fontSize: 40, 
                    mb: 1,
                    color: activeTab === 0 ? 'success.contrastText' : 'success.main'
                  }} 
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: activeTab === 0 ? 'success.contrastText' : 'text.primary',
                    fontWeight: 600
                  }}
                >
                  My Leaves
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: activeTab === 0 ? 'success.contrastText' : 'text.secondary',
                    mt: 1
                  }}
                >
                  Apply & track leaves
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {(isHR || isManager) && (
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: activeTab === 1 ? '2px solid' : '1px solid',
                  borderColor: activeTab === 1 ? 'warning.main' : 'divider',
                  bgcolor: activeTab === 1 ? 'warning.light' : 'background.paper',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => setActiveTab(1)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle 
                    sx={{ 
                      fontSize: 40, 
                      mb: 1,
                      color: activeTab === 1 ? 'warning.contrastText' : 'warning.main'
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: activeTab === 1 ? 'warning.contrastText' : 'text.primary',
                      fontWeight: 600
                    }}
                  >
                    Approvals
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: activeTab === 1 ? 'warning.contrastText' : 'text.secondary',
                      mt: 1
                    }}
                  >
                    Review leave requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          {isHR && (
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: activeTab === 2 ? '2px solid' : '1px solid',
                  borderColor: activeTab === 2 ? 'primary.main' : 'divider',
                  bgcolor: activeTab === 2 ? 'primary.light' : 'background.paper',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => setActiveTab(2)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <AccountBalance 
                    sx={{ 
                      fontSize: 40, 
                      mb: 1,
                      color: activeTab === 2 ? 'primary.contrastText' : 'primary.main'
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: activeTab === 2 ? 'primary.contrastText' : 'text.primary',
                      fontWeight: 600
                    }}
                  >
                    Allocation
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: activeTab === 2 ? 'primary.contrastText' : 'text.secondary',
                      mt: 1
                    }}
                  >
                    Manage leave balances
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {renderTabContent()}
      </Paper>

      <ApplyLeaveDialog
        open={showApplyDialog}
        onClose={() => setShowApplyDialog(false)}
        formData={applyForm}
        onFormChange={handleApplyFormChange}
        onSubmit={handleApplyLeave}
        submitting={submitting}
      />

      <AllocateLeaveDialog
        open={showAllocateDialog}
        onClose={() => setShowAllocateDialog(false)}
        formData={allocateForm}
        onFormChange={handleAllocateFormChange}
        onSubmit={handleAllocateLeave}
        submitting={submitting}
      />
    </Container>
  );
};

export default LeaveManagement;