import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, IconButton, Button, Chip, Avatar, Stack, Card, ToggleButton, ToggleButtonGroup, CircularProgress, MenuItem, Checkbox, TablePagination, FormControlLabel } from '@mui/material';
import { Search, Assignment, Clear, Visibility, PersonAdd } from '@mui/icons-material';
import RequirementViewDialog from '../../components/RequirementViewDialog';
import AssignRecruiterDialog from '../../components/AssignRecruiterDialog';
import { Requirement } from '../../models/Requirement';
import { RequirementStatus } from '../../models/RequirementStatus';
import { requirementService } from '../../services/requirementService';
import { userService } from '../../services/userService';
import { companyService } from '../../services/companyService';
import { User } from '../../models/User';
import { formatDateTimeIST, formatDateOnly } from '../../utils/dateUtils';
import { tableStyles } from '../../styles/tableStyles';
import { alert } from '../../utils/alert';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { handleApiResponse } from '../../utils/apiHandler';

const RequirementList: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuthentication } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [statuses, setStatuses] = useState<RequirementStatus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [viewRequirement, setViewRequirement] = useState<Requirement | null>(null);
  const [assignRequirement, setAssignRequirement] = useState<Requirement | null>(null);
  const [assignForm, setAssignForm] = useState({ recruiter_name: '' });
  const [assignedUsers, setAssignedUsers] = useState<{ username: string; given_name: string | null; family_name: string | null }[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
  const [unassignLoading, setUnassignLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      const authenticated = await checkAuthentication();
      if (!authenticated) {
        alert.error('Please login to access this page');
        navigate('/');
        return;
      }
      
      const loadRequirements = async () => {
        if (!isMounted) return;
        setLoading(true);
        const statusData = await requirementService.getRequirementStatuses();
        if (!isMounted) return;
        setStatuses(statusData);
        
        const companiesResponse = await companyService.getCompanies();
        const companiesData = companiesResponse.data || [];
        setCompanies(companiesData);
        
        await handleApiResponse(
          () => requirementService.getRequirements(),
          (data) => {
            if (!isMounted) return;
            const requirementsWithStatus = (Array.isArray(data) ? data : []).map(req => ({
              ...req,
              status: statusData.find(s => s.id === req.status_id)?.status || 'Unknown',
              company_name: req.company_name || companiesData.find(c => c.id === req.company_id)?.name || 'Unknown Company'
            }));
            setRequirements(requirementsWithStatus);
          },
          () => alert.error('Failed to load requirements')
        );
        if (!isMounted) return;
        setLoading(false);
      };

      const loadUsers = async () => {
        await handleApiResponse(
          () => userService.getUsers(),
          (response) => {
            if (!isMounted) return;
            const usersArray = Array.isArray(response) ? response : (response.users || []);
            const filteredUsers = usersArray.filter(user => user.role?.toLowerCase() !== 'finance');
            setUsers(filteredUsers);
          },
          () => alert.error('Failed to load users')
        );
      };

      loadRequirements();
      loadUsers();
    };
    
    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, [checkAuthentication, navigate]);

  const filteredRequirements = useMemo(() => 
    requirements.filter(requirement => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = (requirement.company_name || '').toLowerCase().includes(searchTermLower) || 
                           (requirement.key_skill || '').toLowerCase().includes(searchTermLower);
      const matchesStatus = statusFilter.length === 0 || (requirement.status_id && statusFilter.includes(requirement.status_id.toString()));
      const matchesActive = !showActiveOnly || (requirement.status_id !== 4 && requirement.status_id !== 5);
      return matchesSearch && matchesStatus && matchesActive;
    }), [requirements, searchTerm, statusFilter, showActiveOnly]);

  const paginatedRequirements = useMemo(() => 
    filteredRequirements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), 
    [filteredRequirements, page, rowsPerPage]);

  const handleView = (requirement: Requirement) => {
    setViewRequirement(requirement);
    setViewOpen(true);
  };

  const showAssignRecruiterDialog = async (requirement: Requirement) => {
    setAssignRequirement(requirement);
    setAssignForm({ recruiter_name: requirement.recruiter_name || '' });
    await loadAssignedUsers(requirement.requirement_id);
    setAssignOpen(true);
  };

  const loadAssignedUsers = async (requirementId: number) => {
    try {
      const recruiters = await requirementService.getRecruiterNames(requirementId);
      const recruitersWithDetails = await Promise.all(
        recruiters.map(async (username: string) => {
          const userDetails = await userService.getUserName(username);
          return {
            username,
            given_name: userDetails?.given_name || null,
            family_name: userDetails?.family_name || null
          };
        })
      );
      setAssignedUsers(recruitersWithDetails);
      
      const assignedUsernames = new Set(recruiters);
      const filteredUsers = users.filter(user => !assignedUsernames.has(user.username));
      setUnassignedUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading assigned users:', error);
      setAssignedUsers([]);
      setUnassignedUsers(users);
    }
  };

  const handleUnassign = async (recruiterName: string) => {
    if (!assignRequirement) return;
    setUnassignLoading(true);
    try {
      await requirementService.changeWorkingStatus(assignRequirement.requirement_id, recruiterName, "No");
      await loadAssignedUsers(assignRequirement.requirement_id);
    } catch (error) {
      console.error('Error unassigning recruiter:', error);
    } finally {
      setUnassignLoading(false);
    }
  };

  const handleAssignSave = async () => {
    if (assignRequirement) {
      setAssignLoading(true);
      await handleApiResponse(
        () => requirementService.assignRecruiter(assignRequirement.requirement_id, assignForm.recruiter_name),
        async () => {
          setRequirements(prev => prev.map(r => 
            r.requirement_id === assignRequirement.requirement_id ? { ...r, recruiter_name: assignForm.recruiter_name } : r
          ));
          await loadAssignedUsers(assignRequirement.requirement_id);
          setAssignForm({ recruiter_name: '' });
        }
      );
      setAssignLoading(false);
    }
  };

  const getStatusColor = (statusId: number) => {
    const status = statuses.find(s => s.id === statusId);
    if (!status) return 'default';
    
    switch (status.status.toLowerCase()) {
      case 'new':
      case 'allocated':
      case 'acknowledged':
      case 'in progress':
        return 'primary';
      case 'awaiting offer':
      case 'offer released':
        return 'warning';
      case 'offer accepted':
      case 'fulfilled':
        return 'success';
      case 'offer declined':
      case 'demand closed':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <PageHeader 
            title="Requirements" 
            subtitle="Manage job requirements and assignments"
          />
          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={() => navigate('/requirements/add')}
            sx={{ borderRadius: 3, m: 2 }}
          >
            Add Requirement
          </Button>
        </Box>
        
        <Box sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by company or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'action.hover'
                }
              }}
            />
            <TextField
              select
              SelectProps={{ 
                multiple: true,
                renderValue: (selected) => {
                  const selectedStatuses = statuses.filter(s => (selected as string[]).includes(s.id.toString()));
                  return selectedStatuses.map(s => s.status).join(', ');
                }
              }}
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(typeof value === 'string' ? [value] : value);
              }}
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'action.hover'
                }
              }}
            >
              {statuses.map(status => (
                <MenuItem key={status.id} value={status.id.toString()}>
                  <Checkbox checked={statusFilter.includes(status.id.toString())} />
                  {status.status}
                </MenuItem>
              ))}
            </TextField>
            {(searchTerm || statusFilter.length > 0 || showActiveOnly) && (
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter([]);
                  setShowActiveOnly(false);
                }}
                sx={{ borderRadius: 3 }}
              >
                Clear All
              </Button>
            )}
          </Stack>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
            }
            label="Show active requirements only"
            sx={{ mb: 2 }}
          />
        
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredRequirements.length === 0 ? (
            <Box sx={tableStyles.emptyState}>
              <Assignment sx={tableStyles.emptyIcon} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No requirements found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {searchTerm || statusFilter.length > 0 ? 'Try adjusting your search or filter' : 'No requirements have been created yet'}
              </Typography>
            </Box>
          ) : (
            <Box>
              <TableContainer sx={tableStyles.container}>
              <Table>
                <TableHead>
                  <TableRow sx={tableStyles.headerRow}>
                    <TableCell sx={tableStyles.headerCell}>Company</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Key Skill</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Recruiter</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Created</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Location</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Budget</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Expected Billing</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Status</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRequirements.map((requirement, index) => (
                    <TableRow 
                      key={requirement.requirement_id}
                      sx={tableStyles.bodyRow(index === paginatedRequirements.length - 1)}
                    >
                      <TableCell sx={tableStyles.bodyCell}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={tableStyles.avatar}>
                            {(requirement.company_name || 'C')[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {requirement.company_name || 'N/A'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>{requirement.key_skill}</TableCell>
                      <TableCell sx={tableStyles.bodyCell}>{requirement.recruiter_name}</TableCell>
                      <TableCell sx={tableStyles.bodyCell}>{formatDateOnly(requirement.created_date)}</TableCell>
                      <TableCell sx={tableStyles.bodyCell}>{requirement.location}</TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        {requirement.budget ? `₹${requirement.budget.toLocaleString()}` : 'N/A'}
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>{formatDateOnly(requirement.expected_billing_date)}</TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Chip 
                          label={requirement.status || 'Unknown'}
                          color={getStatusColor(requirement.status_id)}
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Stack direction="row" spacing={1}>
                          <IconButton 
                            onClick={() => handleView(requirement)}
                            size="small"
                            sx={tableStyles.actionButton}
                            title="View Details"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton 
                            onClick={() => showAssignRecruiterDialog(requirement)}
                            size="small"
                            sx={tableStyles.actionButton}
                            title="Assign Recruiter"
                            disabled={requirement.status_id === 9 || requirement.status_id === 10}
                          >
                            <PersonAdd fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))} 
                </TableBody>
              </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredRequirements.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50]}
                sx={{ borderTop: '1px solid', borderColor: 'divider' }}
              />
            </Box>
          )}
        </Box>

        <RequirementViewDialog
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          requirement={viewRequirement}
          getStatusColor={getStatusColor}
          statuses={statuses}
          onStatusUpdate={(requirementId, statusId) => {
            const statusName = statuses.find(s => s.id === statusId)?.status || 'Unknown';
            setRequirements(prev => prev.map(r => 
              r.requirement_id === requirementId ? { ...r, status_id: statusId, status: statusName } : r
            ));
          }}
          onRequirementUpdate={(updatedRequirement) => {
            setViewRequirement(updatedRequirement);
            setRequirements(prev => prev.map(r => 
              r.requirement_id === updatedRequirement.requirement_id ? { ...r, ...updatedRequirement } : r
            ));
          }}
        />

        <AssignRecruiterDialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          assignedUsers={assignedUsers}
          unassignedUsers={unassignedUsers}
          assignForm={assignForm}
          onAssignFormChange={setAssignForm}
          onSave={handleAssignSave}
          loading={assignLoading}
          unassignLoading={unassignLoading}
          requirement={assignRequirement}
          onUnassign={handleUnassign}
        />
      </Card>
    </Container>
  );
};

export default RequirementList;