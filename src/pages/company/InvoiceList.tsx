import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Stack, Card, ToggleButton, ToggleButtonGroup, MenuItem, Autocomplete, CircularProgress, Tooltip, TablePagination } from '@mui/material';
import { Edit, Search, Receipt, Add, Visibility, ChatBubbleOutline } from '@mui/icons-material';
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
  multiline?: boolean;
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
  multiline = false,
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
      multiline={multiline}
      rows={multiline ? 3 : undefined}
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

interface ResizableHeaderProps {
  column: string;
  label: string;
  width: number;
  onMouseDown: (column: string) => (e: React.MouseEvent) => void;
  resizable?: boolean;
}

const ResizableHeader: React.FC<ResizableHeaderProps> = ({ column, label, width, onMouseDown, resizable = true }) => (
  <TableCell sx={{ ...tableStyles.headerCell, width, position: 'relative' }}>
    {label}
    {resizable && (
      <Box 
        onMouseDown={onMouseDown(column)} 
        sx={{ 
          position: 'absolute', 
          right: 0, 
          top: 0, 
          bottom: 0, 
          width: '5px', 
          cursor: 'col-resize', 
          '&:hover': { bgcolor: 'primary.main' } 
        }} 
      />
    )}
  </TableCell>
);

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const toLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    return toLocalDate(new Date(d.getFullYear(), d.getMonth(), 1));
  });
  const [dateTo, setDateTo] = useState<string>(() => {
    const d = new Date();
    return toLocalDate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  });
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [addingInvoice, setAddingInvoice] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [columnWidths, setColumnWidths] = useState({
    invoice_number: 120,
    po_number: 120,
    company: 180,
    amount: 120,
    raised_date: 120,
    due_date: 120,
    status: 100,
    actions: 120
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [newInvoice, setNewInvoice] = useState<Omit<Invoice, 'id' | 'status' | 'issue_date' | 'created_date' | 'updated_date'> & { amount: number; raised_date: string }>({
    invoice_number: '',
    company_name: '',
    po_number: '',
    amount: 0,
    raised_date: '',
    due_date: '',
    remarks: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      alert.error('Please login to access this page');
      navigate('/login');
      return;
    }
    setLoading(true);
    handleApiResponse(
      () => companyService.getCompanies(),
      (companyData) => {
        const activeCompanies = (Array.isArray(companyData) ? companyData : []).filter(c => c.status === 'active');
        setCompanies(activeCompanies);
      },
      () => {
        alert.error('Failed to load companies');
        setLoading(false);
      }
    );
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (companies.length === 0 || !dateFrom || !dateTo) return;
    setLoading(true);
    handleApiResponse(
      () => invoiceService.getInvoicesByDateRange(dateFrom, dateTo),
      (data) => {
        const invoiceData = Array.isArray(data) ? data : [];
        const invoicesWithNames = invoiceData.map(invoice => ({
          ...invoice,
          company_name: companies.find(c => c.id === (invoice as any).company_id)?.name || 'Unknown Company'
        }));
        setInvoices(invoicesWithNames);
        setLoading(false);
      },
      () => {
        alert.error('Failed to load invoices');
        setLoading(false);
      }
    );
  }, [companies, fetchTrigger]); // dateFrom/dateTo intentionally excluded — fetched only on button click

  const filteredInvoices = useMemo(() =>
    invoices.filter(invoice => {
      const matchesCompany = !selectedCompany || invoice.company_name === selectedCompany;
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesCompany && matchesStatus;
    }), [invoices, selectedCompany, statusFilter]);

  // Reset to first page whenever filters change
  useEffect(() => { setPage(0); }, [selectedCompany, statusFilter, invoices]);

  const paginatedInvoices = useMemo(() =>
    filteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredInvoices, page, rowsPerPage]);

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

    if (newInvoice.remarks) {
      payload.remarks = newInvoice.remarks;
    }

    await handleApiResponse(
      () => invoiceService.createInvoice(payload),
      (invoice) => {
        const invoiceWithCompanyName = {
          ...invoice,
          company_name: selectedCompany.name
        };
        setInvoices(prev => [...prev, invoiceWithCompanyName]);
        setNewInvoice({ invoice_number: '', company_name: '', po_number: '', amount: 0, raised_date: '', due_date: '', remarks: '' });
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

  const handleMouseDown = (column: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[column as keyof typeof columnWidths];

    const handleMouseMove = (e: MouseEvent) => {
      setColumnWidths(prev => ({
        ...prev,
        [column]: Math.max(80, startWidth + e.clientX - startX)
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Raised From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: 'action.hover' } }}
              />
              <TextField
                label="Raised To"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, backgroundColor: 'action.hover' } }}
              />
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={() => setFetchTrigger(t => t + 1)}
                sx={{ px: 3, flexShrink: 0 }}
              >
                Fetch
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  const now = new Date();
                  setDateFrom(toLocalDate(new Date(now.getFullYear(), now.getMonth(), 1)));
                  setDateTo(toLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
                  setFetchTrigger(t => t + 1);
                }}
                sx={{ flexShrink: 0 }}
              >
                Reset
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
            <Box>
            <TableContainer sx={tableStyles.container}>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow sx={tableStyles.headerRow}>
                    <ResizableHeader column="invoice_number" label="Invoice #" width={columnWidths.invoice_number} onMouseDown={handleMouseDown} />
                    <ResizableHeader column="po_number" label="PO Number" width={columnWidths.po_number} onMouseDown={handleMouseDown} />
                    <ResizableHeader column="company" label="Company" width={columnWidths.company} onMouseDown={handleMouseDown} />
                    <ResizableHeader column="amount" label="Amount" width={columnWidths.amount} onMouseDown={handleMouseDown} />
                    <ResizableHeader column="raised_date" label="Raised Date" width={columnWidths.raised_date} onMouseDown={handleMouseDown} />
                    <ResizableHeader column="due_date" label="Due Date" width={columnWidths.due_date} onMouseDown={handleMouseDown} />
                    <ResizableHeader column="status" label="Status" width={columnWidths.status} onMouseDown={handleMouseDown} />
                    <ResizableHeader column="actions" label="Actions" width={columnWidths.actions} resizable={false} onMouseDown={handleMouseDown} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedInvoices.map((invoice, index) => (
                    <Tooltip
                      key={invoice.id}
                      title={invoice.remarks ? (
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.7, display: 'block', mb: 0.5 }}>
                            Remarks
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {invoice.remarks}
                          </Typography>
                        </Box>
                      ) : ''}
                      placement="top-start"
                      arrow
                      disableHoverListener={!invoice.remarks}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: 'grey.900',
                            color: 'common.white',
                            maxWidth: 320,
                            borderRadius: 2,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                            p: 1.5,
                            '& .MuiTooltip-arrow': { color: 'grey.900' }
                          }
                        }
                      }}
                    >
                    <TableRow
                      sx={tableStyles.bodyRow(index === paginatedInvoices.length - 1)}
                    >
                      <TableCell sx={{ ...tableStyles.bodyCell, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ overflow: 'hidden' }}>
                          <Typography variant="subtitle1" fontWeight={500} noWrap>
                            {invoice.invoice_number}
                          </Typography>
                          {invoice.remarks && (
                            <ChatBubbleOutline sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0, opacity: 0.7 }} />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ ...tableStyles.bodyCell, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography noWrap>{invoice.po_number || '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ ...tableStyles.bodyCell, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography noWrap>{invoice.company_name}</Typography>
                      </TableCell>
                      <TableCell sx={{ ...tableStyles.bodyCell, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {CURRENCY_SYMBOL}{invoice.amount.toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ ...tableStyles.bodyCell, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {formatDateTimeIST(invoice.raised_date)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ ...tableStyles.bodyCell, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
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
                        <Stack direction="row" spacing={1}>
                          <IconButton 
                            onClick={() => {
                              setViewInvoice(invoice);
                              setViewOpen(true);
                            }}
                            size="small"
                            sx={tableStyles.actionButton}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
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
                        </Stack>
                      </TableCell>
                    </TableRow>
                    </Tooltip>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredInvoices.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ borderTop: '1px solid', borderColor: 'divider' }}
            />
            </Box>
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
              <FormField 
                field="remarks" 
                label="Remarks" 
                multiline
                newInvoice={newInvoice}
                fieldErrors={fieldErrors}
                addingInvoice={addingInvoice}
                updateInvoiceField={updateInvoiceField}
              />
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

        <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {viewInvoice && (
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Invoice Number</Typography>
                  <Typography variant="body1" fontWeight={500}>{viewInvoice.invoice_number}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">PO Number</Typography>
                  <Typography variant="body1">{viewInvoice.po_number || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Company</Typography>
                  <Typography variant="body1">{viewInvoice.company_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="body1" fontWeight={500}>{CURRENCY_SYMBOL}{viewInvoice.amount.toLocaleString('en-IN')}</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Raised Date</Typography>
                    <Typography variant="body2">{formatDateTimeIST(viewInvoice.raised_date)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Due Date</Typography>
                    <Typography variant="body2">{formatDateTimeIST(viewInvoice.due_date)}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={viewInvoice.status.charAt(0).toUpperCase() + viewInvoice.status.slice(1)}
                      color={getStatusColor(viewInvoice.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </Box>
                {viewInvoice.remarks && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Remarks</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{viewInvoice.remarks}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewOpen(false)}>Close</Button>
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