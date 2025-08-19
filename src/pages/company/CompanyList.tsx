import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, Chip, Avatar, Stack, Card, Divider, ToggleButton, ToggleButtonGroup, CircularProgress } from '@mui/material';
import { Edit, Search, Business } from '@mui/icons-material';
import { Company } from '../../models/Company';
import { companyService } from '../../services/companyService';
import { formatDateTimeIST } from '../../utils/dateUtils';
import { tableStyles } from '../../styles/tableStyles';
import { alert } from '../../utils/alert';
import { showConfirm } from '../../utils/confirm';
import { useAuth } from '../../context/AuthContext';

const CompanyList: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [editForm, setEditForm] = useState({ spoc: '', email_id: '' });
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      alert.error('Please login to access this page');
      navigate('/');
      return;
    }
    
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const data = await companyService.getCompanies();
        setCompanies(data);
      } catch (error) {
        alert.error('Failed to load companies');
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, [isAuthenticated, navigate]);

  const filteredCompanies = useMemo(() => 
    companies.filter(company => {
      const sanitizedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase();
      const matchesSearch = company.name.toLowerCase().includes(sanitizedSearchTerm);
      const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
      return matchesSearch && matchesStatus;
    }), [companies, searchTerm, statusFilter]);

  const handleEdit = (company: Company) => {
    setEditCompany(company);
    setEditForm({ spoc: company.spoc, email_id: company.email_id });
    setEditOpen(true);
  };

  const handleStatusToggle = async (id: number) => {
    const company = companies.find(c => c.id === id);
    if (!company) return;
    
    const newStatus = company.status === 'active' ? 'inactive' : 'active';
    const sanitizedCompanyName = company.name.replace(/[^a-zA-Z0-9\s-_.]/g, '');
    
    const confirmed = await showConfirm(
      `Are you sure you want to change ${sanitizedCompanyName} status to ${newStatus}?`,
      'Update Company Status'
    );
    
    if (!confirmed) return;
    
    try {
      await companyService.updateCompany(id, { status: newStatus });
      setCompanies(prev => prev.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      ));
      alert.success(`Company status updated to ${newStatus}`);
    } catch (error) {
      alert.error('Failed to update company status');
    }
  };

  const handleSave = async () => {
    if (editCompany) {
      // Validate email format
      if (editForm.email_id && !/\S+@\S+\.\S+/.test(editForm.email_id)) {
        alert.error('Please enter a valid email address');
        return;
      }
      
      const updateData: { spoc?: string; email_id?: string } = {};
      
      if (editForm.spoc !== editCompany.spoc) {
        updateData.spoc = editForm.spoc;
      }
      if (editForm.email_id !== editCompany.email_id) {
        updateData.email_id = editForm.email_id;
      }
      
      if (Object.keys(updateData).length > 0) {
        try {
          await companyService.updateCompany(editCompany.id, updateData);
          setCompanies(prev => prev.map(c => 
            c.id === editCompany.id ? { ...c, ...updateData } : c
          ));
          alert.success('Company details updated successfully');
        } catch (error) {
          alert.error('Failed to update company details');
        }
      }
    }
    setEditOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 4, background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px 16px 0 0' }}>
          <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
            Company Directory
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Manage and monitor registered companies
          </Typography>
        </Box>
        
        <Box sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search companies..."
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
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={(_, newFilter) => newFilter && setStatusFilter(newFilter)}
              sx={{ flexShrink: 0 }}
            >
              <ToggleButton value="all" sx={{ px: 3, borderRadius: 2 }}>
                All
              </ToggleButton>
              <ToggleButton value="active" sx={{ px: 3, borderRadius: 2 }}>
                Active
              </ToggleButton>
              <ToggleButton value="inactive" sx={{ px: 3, borderRadius: 2 }}>
                Inactive
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredCompanies.length === 0 ? (
            <Box sx={tableStyles.emptyState}>
              <Business sx={tableStyles.emptyIcon} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No companies found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'No companies have been registered yet'}
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={tableStyles.container}>
              <Table>
                <TableHead>
                  <TableRow sx={tableStyles.headerRow}>
                    <TableCell sx={tableStyles.headerCell}>Company</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Contact Person</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Email</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Created Date</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Last Updated</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Status</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCompanies.map((company, index) => (
                    <TableRow 
                      key={company.id}
                      sx={tableStyles.bodyRow(index === filteredCompanies.length - 1)}
                    >
                      <TableCell sx={tableStyles.bodyCell}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={tableStyles.avatar}>
                            {company.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {company.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.primary">
                          {company.spoc}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.secondary">
                          {company.email_id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTimeIST(company.created_date)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTimeIST(company.updated_date)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Chip 
                          label={company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                          color={company.status === 'active' ? 'success' : 'default'}
                          variant={company.status === 'active' ? 'filled' : 'outlined'}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Switch
                            checked={company.status === 'active'}
                            onChange={() => handleStatusToggle(company.id)}
                            size="small"
                            color="success"
                          />
                          <IconButton 
                            onClick={() => handleEdit(company)}
                            size="small"
                            sx={tableStyles.actionButton}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
        
        <Dialog 
          open={editOpen} 
          onClose={() => setEditOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
            Edit Company Details
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label="Contact Person (SPOC)"
              value={editForm.spoc}
              onChange={(e) => setEditForm({ ...editForm, spoc: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
              inputProps={{ maxLength: 50 }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={editForm.email_id}
              onChange={(e) => {
                const email = e.target.value;
                setEditForm({ ...editForm, email_id: email });
                if (email && !/\S+@\S+\.\S+/.test(email)) {
                  setEmailError('Please enter a valid email address');
                } else {
                  setEmailError('');
                }
              }}
              error={!!emailError}
              helperText={emailError}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={() => setEditOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Container>
  );
};

export default CompanyList;