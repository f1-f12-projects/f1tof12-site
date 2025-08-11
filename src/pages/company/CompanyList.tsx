import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, Chip, Avatar, Stack, Card, Divider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Edit, Search, Business } from '@mui/icons-material';
import { Company } from '../../models/Company';
import { companyService } from '../../services/companyService';

const CompanyList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [editForm, setEditForm] = useState({ spoc: '', email_id: '' });

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await companyService.getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error('Failed to load companies:', error);
      }
    };
    loadCompanies();
  }, []);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (company: Company) => {
    setEditCompany(company);
    setEditForm({ spoc: company.spoc, email_id: company.email_id });
    setEditOpen(true);
  };

  const handleStatusToggle = async (id: number) => {
    const company = companies.find(c => c.id === id);
    if (company) {
      const newStatus = company.status === 'active' ? 'inactive' : 'active';
      const confirmed = window.confirm(`Are you sure you want to change ${company.name} status to ${newStatus}?`);
      if (confirmed) {
        try {
          await companyService.updateCompany(id, { status: newStatus });
          setCompanies(companies.map(c => 
            c.id === id ? { ...c, status: newStatus } : c
          ));
        } catch (error) {
          console.error('Failed to update company status:', error);
        }
      }
    }
  };

  const handleSave = () => {
    if (editCompany) {
      setCompanies(companies.map(company =>
        company.id === editCompany.id
          ? { ...company, spoc: editForm.spoc, email_id: editForm.email_id }
          : company
      ));
    }
    setEditOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px 16px 0 0' }}>
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
                  backgroundColor: 'grey.50'
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
        
          {filteredCompanies.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Business sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No companies found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'No companies have been registered yet'}
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Contact Person</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCompanies.map((company, index) => (
                    <TableRow 
                      key={company.id}
                      sx={{ 
                        '&:hover': { backgroundColor: 'action.hover' },
                        borderBottom: index === filteredCompanies.length - 1 ? 'none' : '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <TableCell sx={{ py: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            {company.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {company.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.primary">
                          {company.spoc}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          {company.email_id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Chip 
                          label={company.status.charAt(0).toUpperCase() + company.status.slice(1)} 
                          color={company.status === 'active' ? 'success' : 'default'}
                          variant={company.status === 'active' ? 'filled' : 'outlined'}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
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
                            sx={{ 
                              color: 'primary.main',
                              '&:hover': { backgroundColor: 'primary.50' }
                            }}
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
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Edit Company Details
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label="Contact Person (SPOC)"
              value={editForm.spoc}
              onChange={(e) => setEditForm({ ...editForm, spoc: e.target.value })}
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
              onChange={(e) => setEditForm({ ...editForm, email_id: e.target.value })}
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