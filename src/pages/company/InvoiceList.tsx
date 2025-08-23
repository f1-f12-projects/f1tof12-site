import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Stack, Card, ToggleButton, ToggleButtonGroup, MenuItem, Autocomplete } from '@mui/material';
import { Edit, Search, Receipt, Add } from '@mui/icons-material';
import { Invoice } from '../../models/Invoice';
import { Company } from '../../models/Company';
import { invoiceService } from '../../services/invoiceService';
import { companyService } from '../../services/companyService';
import { formatDateTimeIST } from '../../utils/dateUtils';
import { tableStyles } from '../../styles/tableStyles';
import { alert } from '../../utils/alert';
import { showConfirm } from '../../utils/confirm';
import { useAuth } from '../../context/AuthContext';
import { handleApiResponse } from '../../utils/apiHandler';

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [newInvoice, setNewInvoice] = useState({
    invoice_number: '',
    company_name: '',
    po_number: '',
    amount: '',
    raised_date: '',
    due_date: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      alert.error('Please login to access this page');
      navigate('/login');
      return;
    }
    
    const loadData = async () => {
      await Promise.all([
        handleApiResponse(
          () => invoiceService.getInvoices(),
          (data) => setInvoices(Array.isArray(data) ? data : []),
          () => alert.error('Failed to load invoices')
        ),
        handleApiResponse(
          () => companyService.getCompanies(),
          (data) => setCompanies((Array.isArray(data) ? data : []).filter(c => c.status === 'active')),
          () => alert.error('Failed to load companies')
        )
      ]);
    };
    loadData();
  }, [isAuthenticated, navigate]);

  const filteredInvoices = useMemo(() => 
    invoices.filter(invoice => {
      const sanitizedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&').toLowerCase();
      const matchesSearch = invoice.invoice_number.toLowerCase().includes(sanitizedSearchTerm) ||
                           invoice.company_name.toLowerCase().includes(sanitizedSearchTerm);
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    }), [invoices, searchTerm, statusFilter]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;
    
    const confirmed = await showConfirm(
      `Change invoice ${invoice.invoice_number} status to ${newStatus}?`,
      'Update Invoice Status'
    );
    
    if (!confirmed) return;
    
    await handleApiResponse(
      () => invoiceService.updateInvoiceStatus(id, newStatus),
      () => {
        setInvoices(prev => prev.map(i => 
          i.id === id ? { ...i, status: newStatus as Invoice['status'] } : i
        ));
      }
    );
  };

  const handleAddInvoice = async () => {
    if (!newInvoice.invoice_number || !newInvoice.company_name || !newInvoice.amount) {
      alert.error('Please fill in all required fields');
      return;
    }

    const selectedCompany = companies.find(c => c.name === newInvoice.company_name);
    if (!selectedCompany) {
      alert.error('Please select a valid company');
      return;
    }

    const payload: any = {
      invoice_number: newInvoice.invoice_number,
      po_number: newInvoice.po_number,
      company_id: selectedCompany.id,
      amount: parseFloat(newInvoice.amount),
      status: 'pending'
    };

    if (newInvoice.raised_date) {
      payload.raised_date = newInvoice.raised_date;
    }
    if (newInvoice.due_date) {
      payload.due_date = newInvoice.due_date;
    }

    await handleApiResponse(
      () => invoiceService.createInvoice(payload),
      (invoice) => {
        setInvoices(prev => [...prev, invoice]);
        setNewInvoice({ invoice_number: '', company_name: '', po_number: '', amount: '', raised_date: '', due_date: '' });
        setAddOpen(false);
      }
    );
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 4, background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #424242 0%, #616161 100%)' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px 16px 0 0' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                Invoice Management
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Track and manage invoice payments
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddOpen(true)}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
            >
              Add Invoice
            </Button>
          </Stack>
        </Box>
        
        <Box sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search invoices..."
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
              <ToggleButton value="all" sx={{ px: 3, borderRadius: 2 }}>All</ToggleButton>
              <ToggleButton value="pending" sx={{ px: 3, borderRadius: 2 }}>Pending</ToggleButton>
              <ToggleButton value="paid" sx={{ px: 3, borderRadius: 2 }}>Paid</ToggleButton>
              <ToggleButton value="overdue" sx={{ px: 3, borderRadius: 2 }}>Overdue</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        
          {filteredInvoices.length === 0 ? (
            <Box sx={tableStyles.emptyState}>
              <Receipt sx={tableStyles.emptyIcon} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No invoices found
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={tableStyles.container}>
              <Table>
                <TableHead>
                  <TableRow sx={tableStyles.headerRow}>
                    <TableCell sx={tableStyles.headerCell}>Invoice #</TableCell>
                    <TableCell sx={tableStyles.headerCell}>PO Number</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Company</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Amount</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Raised Date</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Due Date</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Status</TableCell>
                    <TableCell sx={tableStyles.headerCell}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInvoices.map((invoice, index) => (
                    <TableRow 
                      key={invoice.id}
                      sx={tableStyles.bodyRow(index === filteredInvoices.length - 1)}
                    >
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {invoice.invoice_number}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        {invoice.po_number || '-'}
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        {invoice.company_name}
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          ${invoice.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTimeIST(invoice.issue_date)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTimeIST(invoice.due_date)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Chip 
                          label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          color={getStatusColor(invoice.status)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <IconButton 
                          onClick={() => {
                            setEditInvoice(invoice);
                            setEditOpen(true);
                          }}
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
          <DialogTitle>Add New Invoice</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Invoice Number"
              value={newInvoice.invoice_number}
              onChange={(e) => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              fullWidth
              label="PO Number"
              value={newInvoice.po_number}
              onChange={(e) => setNewInvoice({ ...newInvoice, po_number: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Autocomplete
              fullWidth
              freeSolo
              options={companies.map(c => c.name)}
              value={newInvoice.company_name}
              onChange={(_, value) => setNewInvoice({ ...newInvoice, company_name: value || '' })}
              renderInput={(params) => (
                <TextField {...params} label="Company Name" sx={{ mb: 2 }} />
              )}
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={newInvoice.amount}
              onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
              onWheel={handleWheel}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Raised Date"
              type="date"
              value={newInvoice.raised_date}
              onChange={(e) => setNewInvoice({ ...newInvoice, raised_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={newInvoice.due_date}
              onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddInvoice} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Invoice Status</DialogTitle>
          <DialogContent>
            {editInvoice && (
              <TextField
                fullWidth
                select
                label="Status"
                value={editInvoice.status}
                onChange={(e) => handleStatusUpdate(editInvoice.id, e.target.value)}
                sx={{ mt: 1 }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Container>
  );
};

export default InvoiceList;