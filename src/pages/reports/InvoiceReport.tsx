import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent } from '@mui/material';
import { invoiceService } from '../../services/invoiceService';
import { Invoice } from '../../models/Invoice';
import { handleApiResponse } from '../../utils/apiHandler';
import PageHeader from '../../components/PageHeader';

interface MonthlyData {
  month: string;
  paid: number;
  pending: number;
  overdue: number;
  cancelled: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  cancelledAmount: number;
}

const InvoiceReport: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    if (invoices.length > 0 && selectedYear === '') {
      const availableYears = getAvailableYears();
      setSelectedYear(availableYears[0] || new Date().getFullYear());
    }
  }, [invoices, selectedYear]);

  useEffect(() => {
    if (invoices.length > 0) {
      generateMonthlyData();
    }
  }, [invoices, selectedYear, selectedCompany]);

  const loadInvoices = async () => {
    await handleApiResponse(
      () => invoiceService.getInvoices(),
      (response) => setInvoices(response || [])
    );
  }
    
  const generateMonthlyData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const data: MonthlyData[] = months.map((month, index) => ({
      month,
      paid: 0,
      pending: 0,
      overdue: 0,
      cancelled: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      cancelledAmount: 0
    }));

    invoices.forEach(invoice => {
      const raisedDate = new Date(invoice.raised_date);
      
      if (raisedDate.getFullYear() === selectedYear && 
          (selectedCompany === 'All' || invoice.company_name === selectedCompany)) {
        const monthIndex = raisedDate.getMonth();
        data[monthIndex][invoice.status]++;
        data[monthIndex][`${invoice.status}Amount`] += invoice.amount;
      }
    });

    setMonthlyData(data);
  };

  const getAvailableYears = () => {
    const years = new Set<number>();
    invoices.forEach(invoice => {
      years.add(new Date(invoice.raised_date).getFullYear());
      years.add(new Date(invoice.due_date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const getAvailableCompanies = () => {
    const companies = new Set<string>();
    invoices.forEach(invoice => companies.add(invoice.company_name));
    return ['All', ...Array.from(companies).sort()];
  };

  const totalPaid = monthlyData.reduce((sum, data) => sum + data.paidAmount, 0);
  const totalPending = monthlyData.reduce((sum, data) => sum + data.pendingAmount, 0);
  const totalOverdue = monthlyData.reduce((sum, data) => sum + data.overdueAmount, 0);
  const totalCancelled = monthlyData.reduce((sum, data) => sum + data.cancelledAmount, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 8 }}>
      <PageHeader title="Invoice Report" />
      
      <Box sx={{ mb: 3, mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {getAvailableYears().map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Company</InputLabel>
          <Select
            value={selectedCompany}
            label="Company"
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            {getAvailableCompanies().map(company => (
              <MenuItem key={company} value={company}>{company}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Showing invoice status trends by month (based on Raised Date)
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">Paid ({selectedYear})</Typography>
              <Typography variant="h5">₹{totalPaid.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">Pending ({selectedYear})</Typography>
              <Typography variant="h5">₹{totalPending.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">Overdue ({selectedYear})</Typography>
              <Typography variant="h5">₹{totalOverdue.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Cancelled ({selectedYear})</Typography>
              <Typography variant="h5">₹{totalCancelled.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Monthly Trend - Invoice Count by Status</Typography>
        <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: 200, mb: 4 }}>
          {monthlyData.map((data) => {
            const maxCount = Math.max(...monthlyData.map(d => Math.max(d.paid, d.pending, d.overdue, d.cancelled)), 1);
            const paidHeight = data.paid > 0 ? Math.max((data.paid / maxCount) * 150, 10) : 0;
            const pendingHeight = data.pending > 0 ? Math.max((data.pending / maxCount) * 150, 10) : 0;
            const overdueHeight = data.overdue > 0 ? Math.max((data.overdue / maxCount) * 150, 10) : 0;
            const cancelledHeight = data.cancelled > 0 ? Math.max((data.cancelled / maxCount) * 150, 10) : 0;
            return (
              <Box key={data.month} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'end', mb: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {data.paid > 0 && <Typography variant="caption" sx={{ fontSize: '9px', mb: 0.5 }}>{data.paid}</Typography>}
                    <Box sx={{ width: 15, height: `${paidHeight}px`, bgcolor: '#4caf50', borderRadius: '2px 2px 0 0' }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {data.pending > 0 && <Typography variant="caption" sx={{ fontSize: '9px', mb: 0.5 }}>{data.pending}</Typography>}
                    <Box sx={{ width: 15, height: `${pendingHeight}px`, bgcolor: '#ff9800', borderRadius: '2px 2px 0 0' }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {data.overdue > 0 && <Typography variant="caption" sx={{ fontSize: '9px', mb: 0.5 }}>{data.overdue}</Typography>}
                    <Box sx={{ width: 15, height: `${overdueHeight}px`, bgcolor: '#f44336', borderRadius: '2px 2px 0 0' }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {data.cancelled > 0 && <Typography variant="caption" sx={{ fontSize: '9px', mb: 0.5 }}>{data.cancelled}</Typography>}
                    <Box sx={{ width: 15, height: `${cancelledHeight}px`, bgcolor: '#9e9e9e', borderRadius: '2px 2px 0 0' }} />
                  </Box>
                </Box>
                <Typography variant="caption">{data.month}</Typography>
              </Box>
            );
          })}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50' }} />
            <Typography variant="body2">Paid</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800' }} />
            <Typography variant="body2">Pending</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#f44336' }} />
            <Typography variant="body2">Overdue</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#9e9e9e' }} />
            <Typography variant="body2">Cancelled</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Monthly Trend - Invoice Amount by Status</Typography>
        <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: 200 }}>
          {monthlyData.map((data) => {
            const maxAmount = Math.max(...monthlyData.map(d => Math.max(d.paidAmount, d.pendingAmount, d.overdueAmount, d.cancelledAmount)), 1);
            const paidHeight = data.paidAmount > 0 ? Math.max((data.paidAmount / maxAmount) * 150, 10) : 0;
            const pendingHeight = data.pendingAmount > 0 ? Math.max((data.pendingAmount / maxAmount) * 150, 10) : 0;
            const overdueHeight = data.overdueAmount > 0 ? Math.max((data.overdueAmount / maxAmount) * 150, 10) : 0;
            const cancelledHeight = data.cancelledAmount > 0 ? Math.max((data.cancelledAmount / maxAmount) * 150, 10) : 0;
            return (
              <Box key={data.month} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'end', mb: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {data.paidAmount > 0 && <Typography variant="caption" sx={{ fontSize: '8px', mb: 0.5 }}>₹{(data.paidAmount/1000).toFixed(0)}k</Typography>}
                    <Box sx={{ width: 15, height: `${paidHeight}px`, bgcolor: '#4caf50', borderRadius: '2px 2px 0 0' }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {data.pendingAmount > 0 && <Typography variant="caption" sx={{ fontSize: '8px', mb: 0.5 }}>₹{(data.pendingAmount/1000).toFixed(0)}k</Typography>}
                    <Box sx={{ width: 15, height: `${pendingHeight}px`, bgcolor: '#ff9800', borderRadius: '2px 2px 0 0' }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {data.overdueAmount > 0 && <Typography variant="caption" sx={{ fontSize: '8px', mb: 0.5 }}>₹{(data.overdueAmount/1000).toFixed(0)}k</Typography>}
                    <Box sx={{ width: 15, height: `${overdueHeight}px`, bgcolor: '#f44336', borderRadius: '2px 2px 0 0' }} />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {data.cancelledAmount > 0 && <Typography variant="caption" sx={{ fontSize: '8px', mb: 0.5 }}>₹{(data.cancelledAmount/1000).toFixed(0)}k</Typography>}
                    <Box sx={{ width: 15, height: `${cancelledHeight}px`, bgcolor: '#9e9e9e', borderRadius: '2px 2px 0 0' }} />
                  </Box>
                </Box>
                <Typography variant="caption">{data.month}</Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Container>
  );
};

export default InvoiceReport;
