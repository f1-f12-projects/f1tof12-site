import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Button, Stack, Card, CardContent, Grid, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Radio, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material';
import { Add, Assignment, AccountBalance, Person, CheckCircle, CalendarToday } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { leaveService, Leave, LeaveDashboard } from '../../services/leaveService';
import { alert } from '../../utils/alert';
import LeaveStats from './components/LeaveStats';
import LeaveTable from './components/LeaveTable';
import LeaveBalance from './components/LeaveBalance';
import LeaveBalanceTable from './components/LeaveBalanceTable';
import ApplyLeaveDialog from './components/ApplyLeaveDialog';
import AllocateLeaveDialog from './components/AllocateLeaveDialog';
import Holidays from './Holidays';

const LeaveManagement: React.FC = () => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<LeaveDashboard | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [pendingLeavesLoading, setPendingLeavesLoading] = useState(false);
  const [showAllLeaves, setShowAllLeaves] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalComments, setApprovalComments] = useState('');
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
  const totalTabs = isHR ? 4 : (isManager ? 3 : 2);

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

  const loadPendingLeaves = async () => {
    try {
      setPendingLeavesLoading(true);
      const response = await leaveService.getAllLeaves();
      if (response.success && response.data) {
        setPendingLeaves(response.data.filter(leave => leave.status === 'pending'));
        setAllLeaves(response.data);
      }
    } catch (error: any) {
      alert.error(error?.message || 'Failed to load leaves');
    } finally {
      setPendingLeavesLoading(false);
    }
  };

  const handleApprovalSubmit = async () => {
    if (!selectedLeaveId) return;
    
    try {
      const status = approvalAction === 'approve' ? 'approved' : 'rejected';
      const response = await leaveService.approveLeave(selectedLeaveId, status, approvalComments);
      if (response.success) {
        alert.success(`Leave ${approvalAction}d successfully`);
        setShowApprovalDialog(false);
        setSelectedLeaveId(null);
        setApprovalComments('');
        await loadPendingLeaves();
      }
    } catch (error: any) {
      alert.error(error?.message || `Failed to ${approvalAction} leave`);
    }
  };

  const handleApprovalClick = (leaveId: number, action: 'approve' | 'reject') => {
    setSelectedLeaveId(leaveId);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const handleTabClick = (tabIndex: number) => {
    setActiveTab(tabIndex);
    if (tabIndex === 1 && (isHR || isManager)) {
      loadPendingLeaves();
    }
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
            <LeaveTable isHR={false} leaves={dashboard?.leaves} />
          </Box>
        );
      case 1: // Approval Tab
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Leave Approvals</Typography>
              {isHR && (
                <Button
                  variant={showAllLeaves ? "contained" : "outlined"}
                  onClick={() => setShowAllLeaves(!showAllLeaves)}
                >
                  {showAllLeaves ? 'Show Pending Only' : 'View All Leaves'}
                </Button>
              )}
            </Box>
            {pendingLeavesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (showAllLeaves ? allLeaves : pendingLeaves).length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {showAllLeaves ? 'No leaves found' : 'No pending leaves for approval'}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, elevation: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Employee</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Type of Leave</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>From Date</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>To Date</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>No of Days</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Created Date</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Reason</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(showAllLeaves ? allLeaves : pendingLeaves).map((leave, index) => (
                      <TableRow 
                        key={leave.id}
                        sx={{
                          bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper',
                          '&:hover': { bgcolor: 'action.hover' },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>
                          {leave.given_name && leave.family_name 
                            ? `${leave.given_name} ${leave.family_name}` 
                            : leave.username}
                        </TableCell>
                        <TableCell sx={{ textTransform: 'capitalize', fontWeight: 500 }}>{leave.leave_type}</TableCell>
                        <TableCell>{new Date(leave.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(leave.end_date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{leave.days}</TableCell>
                        <TableCell>{new Date(leave.created_date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Tooltip title={leave.reason} arrow>
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                cursor: 'help'
                              }}
                            >
                              {leave.reason}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={leave.status}
                            color={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning'}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {leave.status === 'pending' ? (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleApprovalClick(leave.id, 'approve')}
                                  sx={{ borderRadius: 1 }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleApprovalClick(leave.id, 'reject')}
                                  sx={{ borderRadius: 1 }}
                                >
                                  Reject
                                </Button>
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                {leave.status === 'approved' ? 'Approved' : 'Rejected'}
                                {leave.approver_username && ` by ${leave.approver_username}`}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );
      case 2: // Allocation Tab (HR only) or Holidays Tab (for non-HR)
        if (isHR) {
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
        } else {
          return <Holidays />;
        }
      case 3: // Holidays Tab (HR only)
        return <Holidays />;
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
          <Grid item xs={12} md={12/totalTabs}>
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
              onClick={() => handleTabClick(0)}
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
            <Grid item xs={12} md={12/totalTabs}>
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
                onClick={() => handleTabClick(1)}
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
          <Grid item xs={12} md={12/totalTabs}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: activeTab === (isHR ? 3 : 2) ? '2px solid' : '1px solid',
                borderColor: activeTab === (isHR ? 3 : 2) ? 'info.main' : 'divider',
                bgcolor: activeTab === (isHR ? 3 : 2) ? 'info.light' : 'background.paper',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleTabClick(isHR ? 3 : 2)}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <CalendarToday 
                  sx={{ 
                    fontSize: 40, 
                    mb: 1,
                    color: activeTab === (isHR ? 3 : 2) ? 'info.contrastText' : 'info.main'
                  }} 
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: activeTab === (isHR ? 3 : 2) ? 'info.contrastText' : 'text.primary',
                    fontWeight: 600
                  }}
                >
                  Holidays
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: activeTab === (isHR ? 3 : 2) ? 'info.contrastText' : 'text.secondary',
                    mt: 1
                  }}
                >
                  View & select holidays
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {isHR && (
            <Grid item xs={12} md={12/totalTabs}>
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
                onClick={() => handleTabClick(2)}
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

      <Dialog open={showApprovalDialog} onClose={() => setShowApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments (Optional)"
            value={approvalComments}
            onChange={(e) => setApprovalComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
          <Button
            onClick={handleApprovalSubmit}
            variant="contained"
            color={approvalAction === 'approve' ? 'success' : 'error'}
          >
            {approvalAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveManagement;