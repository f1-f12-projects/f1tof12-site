import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Card, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, MenuItem, Autocomplete, Switch, Grid, Avatar, ToggleButton, ToggleButtonGroup, IconButton, CircularProgress, FormControl, InputLabel, Select } from '@mui/material';
import { Search, Person, Add, Edit } from '@mui/icons-material';
import { SPOC as SPOCModel } from '../../models/SPOC';
import { Company } from '../../models/Company';
import { companyService } from '../../services/companyService';
import { tableStyles } from '../../styles/tableStyles';
import { alert } from '../../utils/alert';
import { showConfirm } from '../../utils/confirm';
import { spocService } from '../../services/spocService';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { handleApiResponse } from '../../utils/apiHandler';

const SPOC: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [spocs, setSpocs] = useState<SPOCModel[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editSpoc, setEditSpoc] = useState<SPOCModel | null>(null);
  const [originalSpoc, setOriginalSpoc] = useState<SPOCModel | null>(null);
  const [newSpoc, setNewSpoc] = useState({ name: '', email: '', phone: '', company: '', location: '', status: 'active' as 'active' | 'inactive' });

  useEffect(() => {
    if (!isAuthenticated) {
      alert.error('Please login to access this page');
      navigate('/');
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        handleApiResponse(
          () => companyService.getCompanies(),
          (data) => setCompanies(Array.isArray(data) ? data : []),
          () => alert.error('Failed to load companies')
        ),
        handleApiResponse(
          () => spocService.getSPOCs(),
          (data) => setSpocs(Array.isArray(data) ? data : []),
          () => alert.error('Failed to load SPOCs')
        )
      ]);
      setLoading(false);
    };
    loadData();
  }, [isAuthenticated, navigate]);

  const filteredSpocs = useMemo(() => 
    spocs.filter(spoc => {
      const search = searchTerm.toLowerCase();
      const company = companies.find(c => c.id === spoc.company_id);
      const companyName = company?.name || '';
      const matchesSearch = spoc.name.toLowerCase().includes(search) || companyName.toLowerCase().includes(search);
      const matchesCompany = !selectedCompany || companyName === selectedCompany;
      return matchesSearch && matchesCompany;
    }), [spocs, searchTerm, selectedCompany, companies]);

  const handleAddSpoc = useCallback(async () => {
    const companyId = companies.find(c => c.name === newSpoc.company)?.id || 0;
    if (!newSpoc.name || !newSpoc.email || !newSpoc.phone || !companyId) {
      alert.error('Please fill all fields');
      return;
    }

    setAddLoading(true);
    await handleApiResponse(
      () => spocService.createSPOC({
        name: newSpoc.name,
        email_id: newSpoc.email,
        phone: newSpoc.phone,
        company_id: companyId,
        location: newSpoc.location,
        status: newSpoc.status
      }),
      async () => {
        setNewSpoc({ name: '', email: '', phone: '', company: '', location: '', status: 'active' });
        setAddOpen(false);
        // Refresh SPOC list
        await handleApiResponse(
          () => spocService.getSPOCs(),
          (data) => setSpocs(Array.isArray(data) ? data : [])
        );
      }
    );
    setAddLoading(false);
  }, [newSpoc, companies]);

  const handleEdit = useCallback((spoc: SPOCModel) => {
    setEditSpoc(spoc);
    setOriginalSpoc(spoc);
    setEditOpen(true);
  }, []);

  const handleEditSave = useCallback(async () => {
    if (editSpoc && originalSpoc) {
      const confirmed = await showConfirm('Are you sure you want to save these changes?', 'Save SPOC Changes');
      if (confirmed) {
        const updateData: Partial<Omit<SPOCModel, 'id'>> = {};
        
        if (editSpoc.name !== originalSpoc.name) updateData.name = editSpoc.name;
        if (editSpoc.email_id !== originalSpoc.email_id) updateData.email_id = editSpoc.email_id;
        if (editSpoc.phone !== originalSpoc.phone) updateData.phone = editSpoc.phone;
        if (editSpoc.location !== originalSpoc.location) updateData.location = editSpoc.location;
        if (editSpoc.status !== originalSpoc.status) updateData.status = editSpoc.status;
        
        if (Object.keys(updateData).length > 0) {
          await handleApiResponse(
            () => spocService.updateSPOC(editSpoc.id, updateData),
            async () => {
              setEditOpen(false);
              setEditSpoc(null);
              setOriginalSpoc(null);
              // Refresh SPOC list
              await handleApiResponse(
                () => spocService.getSPOCs(),
                (data) => setSpocs(Array.isArray(data) ? data : [])
              );
            }
          );
        } else {
          setEditOpen(false);
          setEditSpoc(null);
          setOriginalSpoc(null);
        }
      }
    }
  }, [editSpoc, originalSpoc]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <PageHeader title="SPOC Directory" subtitle="Single Point of Contact" />
        
        <Box sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 200, mr: 2 }}>
              <InputLabel>Company</InputLabel>
              <Select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                label="Company"
                size="small"
              >
                <MenuItem value="">All Companies</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.name}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by company or SPOC name..."
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

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddOpen(true)}
              sx={{ borderRadius: 2, px: 3, flexShrink: 0 }}
            >
              Add SPOC
            </Button>
          </Stack>
        
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 200,
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: 2
            }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : filteredSpocs.length === 0 ? (
            <Box sx={tableStyles.emptyState}>
              <Person sx={tableStyles.emptyIcon} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No SPOC found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {searchTerm ? 'Try adjusting your search' : 'No SPOCs available'}
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={tableStyles.container}>
              <Table>
                <TableHead>
                  <TableRow sx={tableStyles.headerRow}>
                    <TableCell sx={tableStyles.headerCell}>SPOC Name</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Email</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Phone</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Company</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Location</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Status</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSpocs.map((spoc, index) => (
                    <TableRow 
                      key={spoc.id}
                      sx={tableStyles.bodyRow(index === filteredSpocs.length - 1)}
                    >
                      <TableCell sx={tableStyles.bodyCell}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={tableStyles.avatar}>
                            {spoc.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {spoc.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.secondary">
                          {spoc.email_id}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.secondary">
                          {spoc.phone}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.primary">
                          {companies.find(c => c.id === spoc.company_id)?.name || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.secondary">
                          {spoc.location || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Chip 
                          label={spoc.status.charAt(0).toUpperCase() + spoc.status.slice(1)}
                          color={spoc.status === 'active' ? 'success' : 'default'}
                          variant={spoc.status === 'active' ? 'filled' : 'outlined'}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <IconButton 
                          onClick={() => handleEdit(spoc)}
                          size="small"
                          sx={tableStyles.actionButton}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
        
        <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New SPOC</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {[
                { key: 'name', label: 'SPOC Name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Phone', type: 'text' },
                { key: 'location', label: 'Location', type: 'text' }
              ].map(field => (
                <TextField
                  key={field.key}
                  fullWidth
                  label={field.label}
                  type={field.type}
                  value={newSpoc[field.key as keyof typeof newSpoc]}
                  onChange={(e) => setNewSpoc({ ...newSpoc, [field.key]: e.target.value })}
                />
              ))}
              <Autocomplete
                fullWidth
                options={companies.map(c => c.name)}
                value={newSpoc.company || null}
                onChange={(_, value) => setNewSpoc({ ...newSpoc, company: value || '' })}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => <TextField {...params} label="Company" />}
              />
              <TextField select fullWidth label="Status" value={newSpoc.status}
                onChange={(e) => setNewSpoc({ ...newSpoc, status: e.target.value as 'active' | 'inactive' })}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)} disabled={addLoading}>Cancel</Button>
            <Button 
              onClick={handleAddSpoc} 
              variant="contained" 
              disabled={addLoading}
              startIcon={addLoading ? <CircularProgress size={16} /> : undefined}
            >
              {addLoading ? 'Adding...' : 'Add SPOC'}
            </Button>
          </DialogActions>
        </Dialog>
        
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit - {editSpoc?.name}</DialogTitle>
          <DialogContent>
            {editSpoc && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editSpoc.name}
                  onChange={(e) => setEditSpoc({ ...editSpoc, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editSpoc.email_id}
                  onChange={(e) => setEditSpoc({ ...editSpoc, email_id: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={editSpoc.phone || ''}
                  onChange={(e) => setEditSpoc({ ...editSpoc, phone: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Company"
                  value={companies.find(c => c.id === editSpoc.company_id)?.name || 'Unknown'}
                  InputProps={{ readOnly: true }}
                  sx={{ '& .MuiInputBase-input': { color: 'text.disabled' } }}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Container>
  );
};

export default SPOC;