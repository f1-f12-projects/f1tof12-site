import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Stack, Card, ToggleButton, ToggleButtonGroup, MenuItem, Autocomplete, CircularProgress } from '@mui/material';
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
import { CURRENCY_SYMBOL } from '../../utils/constants';

interface FormFieldProps {
  field: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[] | null;
  newInvoice: any;
  fieldErrors: {[key: string]: string};
  addingInvoice: boolean;
  updateInvoiceField: (field: string, value: any) => void;
  handleWheel?: (event: React.WheelEvent) => void;
}

const FormField: React.FC<FormFieldProps> = ({ 
  field, 
  label, 
  type = 'text', 
  required = false, 
  options = null,
  newInvoice,
  fieldErrors,
  addingInvoice,
  updateInvoiceField,
  handleWheel
}) => {
  if (!newInvoice) return null;
  
  const displayValue = field === 'amount' && newInvoice[field] > 0 
    ? newInvoice[field].toLocaleString('en-IN')
    : newInvoice[field] || (type === 'number' ? 0 : '');

  const commonProps = {
    value: displayValue,
    disabled: addingInvoice,
    error: !!fieldErrors[field],
    helperText: fieldErrors[field]
  };

  if (options) {
    return (
      <Autocomplete
        options={options}
        value={newInvoice[field] || null}
        onChange={(_, value) => updateInvoiceField(field, value || '')}
        disabled={addingInvoice}
        renderInput={(params) => (
          <TextField {...params} label={`${label}${required ? ' *' : ''}`} {...commonProps} />
        )}
      />
    );
  }

  return (
    <TextField
      label={`${label}${required ? ' *' : ''}`}
      type={field === 'amount' ? 'text' : type}
      onChange={(e) => {
        if (field === 'amount') {
          const value = e.target.value.replace(/[^0-9]/g, '');
          updateInvoiceField(field, parseFloat(value) || 0);
        } else if (type === 'number') {
          const value = e.target.value.replace(/,/g, '');
          updateInvoiceField(field, parseFloat(value) || 0);
        } else {
          updateInvoiceField(field, e.target.value);
        }
      }}
      onWheel={type === 'number' ? handleWheel : undefined}
      InputLabelProps={type === 'date' ? { shrink: true } : undefined}
      InputProps={field === 'amount' ? { startAdornment: CURRENCY_SYMBOL } : undefined}
      {...commonProps}
    />
  );
};

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [dueDateFrom, setDueDateFrom] = useState<string>('');
  const [dueDateTo, setDueDateTo] = useState<string>('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [addingInvoice, setAddingInvoice] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [newInvoice, setNewInvoice] = useState<Omit<Invoice, 'id' | 'status' | 'issue_date' | 'created_date' | 'updated_date'> & { amount: number; raised_date: string }>({
    invoice_number: '',
    company_name: '',
    po_number: '',
    amount: 0,
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
      setLoading(true);
      await handleApiResponse(
        () => companyService.getCompanies(),
        async (companyData) => {
          const activeCompanies = (Array.isArray(companyData) ? companyData : []).filter(c => c.status === 'active');
          setCompanies(activeCompanies);
          
          await handleApiResponse(
            () => invoiceService.getInvoices(),
            (data) => {
              const invoiceData = Array.isArray(data) ? data : [];
              const invoicesWithNames = invoiceData.map(invoice => ({
                ...invoice,
                company_name: activeCompanies.find(c => c.id === (invoice as any).company_id)?.name || 'Unknown Company'
              }));
              setInvoices(invoicesWithNames);
              setLoading(false);
            },
            () => {
              alert.error('Failed to load invoices');
              setLoading(false);
            }
          );
        },
        () => {
          alert.error('Failed to load companies');
          setLoading(false);
        }
      );
    };
    loadData();
  }, [isAuthenticated, navigate]);

  const filteredInvoices = useMemo(() => 
    invoices.filter(invoice => {
      const matchesCompany = !selectedCompany || invoice.company_name === selectedCompany;
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      // Raised date filtering
      const dateToCheck = invoice.raised_date || (invoice as any).raised_date;
      let matchesRaisedDate = true;
      if (dateToCheck && (dateFrom || dateTo)) {
        const invoiceDate = new Date(dateToCheck.split('T')[0]);
        const matchesDateFrom = !dateFrom || invoiceDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || invoiceDate <= new Date(dateTo);
        matchesRaisedDate = matchesDateFrom && matchesDateTo;
      }
      
      // Due date filtering
      let matchesDueDate = true;
      if (invoice.due_date && (dueDateFrom || dueDateTo)) {
        const dueDate = new Date(invoice.due_date.split('T')[0]);
        const matchesDueDateFrom = !dueDateFrom || dueDate >= new Date(dueDateFrom);
        const matchesDueDateTo = !dueDateTo || dueDate <= new Date(dueDateTo);
        matchesDueDate = matchesDueDateFrom && matchesDueDateTo;
      }
      
      return matchesCompany && matchesStatus && matchesRaisedDate && matchesDueDate;
    }), [invoices, selectedCompany, statusFilter, dateFrom, dateTo, dueDateFrom, dueDateTo]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;
    
    const confirmed = await showConfirm(
      `Change invoice ${invoice.invoice_number} status to ${newStatus}?`,
      'Update Invoice Status'
    );
    
    if (!confirmed) return;
    
    setEditOpen(false);
    setUpdatingStatus(id);
    
    await handleApiResponse(
      () => invoiceService.updateInvoiceStatus(id, newStatus),
      (updatedInvoice) => {
        setInvoices(prev => prev.map(i => 
          i.id === id ? { ...i, status: newStatus as Invoice['status'] } : i
        ));
        setUpdatingStatus(null);
      },
      () => setUpdatingStatus(null)
    );
  };

  const updateInvoiceField = (field: string, value: any) => {
    setNewInvoice(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };



  const handleAddInvoice = async () => {
    const errors: {[key: string]: string} = {};
    
    if (!newInvoice.invoice_number) errors.invoice_number = 'Invoice number is required';
    if (!newInvoice.company_name) errors.company_name = 'Company name is required';
    if (!newInvoice.amount || newInvoice.amount <= 0) errors.amount = 'Amount must be greater than 0';
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const errorMessages = Object.values(errors);
      alert.error(errorMessages.join(', '));
      return;
    }
    
    setFieldErrors({});
    setAddingInvoice(true);

    const selectedCompany = companies.find(c => c.name === newInvoice.company_name);
    if (!selectedCompany) {
      alert.error('Please select a valid company');
      return;
    }

    const payload: any = {
      invoice_number: newInvoice.invoice_number,
      po_number: newInvoice.po_number,
      company_id: selectedCompany.id,
      amount: newInvoice.amount,
      status: 'pending',
      raised_date: newInvoice.raised_date || new Date().toISOString().split('T')[0]
    };

    if (newInvoice.due_date) {
      payload.due_date = newInvoice.due_date;
    }

    await handleApiResponse(
      () => invoiceService.createInvoice(payload),
      (invoice) => {
        const invoiceWithCompanyName = {
          ...invoice,
          company_name: selectedCompany.name
        };
        setInvoices(prev => [...prev, invoiceWithCompanyName]);
        setNewInvoice({ invoice_number: '', company_name: '', po_number: '', amount: 0, raised_date: '', due_date: '' });
        setFieldErrors({});
        setAddOpen(false);
      },
      () => setAddingInvoice(false)
    );
    setAddingInvoice(false);
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
  };

  const getCompanyName = (companyId: number): string => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || 'Unknown Company';
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
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Autocomplete
                fullWidth
                options={companies.map(c => c.name)}
                value={selectedCompany}
                onChange={(_, value) => setSelectedCompany(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Filter by company..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'action.hover'
                      }
                    }}
                  />
                )}
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Raised From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'action.hover'
                  }
                }}
              />
              <TextField
                label="Raised To"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'action.hover'
                  }
                }}
              />
              <TextField
                label="Due From"
                type="date"
                value={dueDateFrom}
                onChange={(e) => setDueDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'action.hover'
                  }
                }}
              />
              <TextField
                label="Due To"
                type="date"
                value={dueDateTo}
                onChange={(e) => setDueDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'action.hover'
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setDueDateFrom('');
                  setDueDateTo('');
                }}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                Clear All
              </Button>
            </Stack>
          </Stack>
        
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredInvoices.length === 0 ? (
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
                          {CURRENCY_SYMBOL}{invoice.amount.toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTimeIST(invoice.raised_date)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTimeIST(invoice.due_date)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tableStyles.bodyCell}>
                        {updatingStatus === invoice.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Chip 
                            label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            color={getStatusColor(invoice.status)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        )}
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
        
        <Dialog open={addOpen} onClose={() => !addingInvoice && setAddOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Invoice</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <FormField 
                field="invoice_number" 
                label="Invoice Number" 
                required 
                newInvoice={newInvoice}
                fieldErrors={fieldErrors}
                addingInvoice={addingInvoice}
                updateInvoiceField={updateInvoiceField}
              />
              <FormField 
                field="po_number" 
                label="PO Number" 
                newInvoice={newInvoice}
                fieldErrors={fieldErrors}
                addingInvoice={addingInvoice}
                updateInvoiceField={updateInvoiceField}
              />
              <FormField 
                field="company_name" 
                label="Company Name" 
                required 
                options={companies.map(c => c.name)} 
                newInvoice={newInvoice}
                fieldErrors={fieldErrors}
                addingInvoice={addingInvoice}
                updateInvoiceField={updateInvoiceField}
              />
              <FormField 
                field="amount" 
                label="Amount" 
                type="number" 
                required 
                newInvoice={newInvoice}
                fieldErrors={fieldErrors}
                addingInvoice={addingInvoice}
                updateInvoiceField={updateInvoiceField}
                handleWheel={handleWheel}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <FormField 
                  field="raised_date" 
                  label="Raised Date" 
                  type="date" 
                  newInvoice={newInvoice}
                  fieldErrors={fieldErrors}
                  addingInvoice={addingInvoice}
                  updateInvoiceField={updateInvoiceField}
                />
                <FormField 
                  field="due_date" 
                  label="Due Date" 
                  type="date" 
                  newInvoice={newInvoice}
                  fieldErrors={fieldErrors}
                  addingInvoice={addingInvoice}
                  updateInvoiceField={updateInvoiceField}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)} disabled={addingInvoice}>Cancel</Button>
            <Button 
              onClick={handleAddInvoice} 
              variant="contained" 
              disabled={addingInvoice}
              startIcon={addingInvoice ? <CircularProgress size={16} /> : null}
            >
              {addingInvoice ? 'Creating...' : 'Create'}
            </Button>
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