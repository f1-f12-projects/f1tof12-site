import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material';
import { Holiday, HolidaysResponse } from '../../models/Holiday';
import { FinancialYear } from '../../models/FinancialYear';
import { holidayService } from '../../services/holidayService';
import { useAlert } from '../../utils/alert';
import { showConfirm } from '../../utils/confirm';

const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<HolidaysResponse | null>(null);
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptional, setSelectedOptional] = useState<number[]>([]);
  const [tempSelectedOptional, setTempSelectedOptional] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchFinancialYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchHolidays(selectedYear);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (holidays) {
      const selected = holidays.selected_optional_holidays.map(h => h.id);
      setSelectedOptional(selected);
      setTempSelectedOptional(selected);
    }
  }, [holidays]);

  const fetchFinancialYears = async () => {
    try {
      setError(null);
      const response = await holidayService.getFinancialYears();
      if (response.success && response.data) {
        setFinancialYears(response.data);
        const activeYear = response.data.find(fy => fy.is_active);
        if (activeYear) {
          setSelectedYear(activeYear.id);
        }
      } else {
        setError('Failed to fetch financial years');
      }
    } catch (error) {
      setError('Error fetching financial years');
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async (yearId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holidayService.getMyHolidays(yearId);
      if (response.success && response.data) {
        setHolidays(response.data);
      } else {
        setError('Failed to fetch holidays');
      }
    } catch (error) {
      setError('Error fetching holidays');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleOptionalHolidayToggle = (holidayId: number) => {
    if (tempSelectedOptional.includes(holidayId)) {
      setTempSelectedOptional(prev => prev.filter(id => id !== holidayId));
    } else if (tempSelectedOptional.length < 2) {
      setTempSelectedOptional(prev => [...prev, holidayId]);
    } else {
      showAlert('You can select maximum 2 optional holidays', 'warning');
    }
  };

  const handleSubmit = async () => {
    const confirmed = await showConfirm(
      'Once submitted, you cannot edit this in this financial year. Confirm to proceed.',
      'Confirm Holiday Selection'
    );
    
    if (!confirmed) return;
    
    try {
      setSaving(true);
      const response = await holidayService.selectOptionalHolidays(tempSelectedOptional, selectedYear!);
      if (response.success) {
        setSelectedOptional(tempSelectedOptional);
        showAlert('Holiday selection updated successfully', 'success');
        if (selectedYear) {
          fetchHolidays(selectedYear);
        }
      } else {
        showAlert('Failed to update holiday selection', 'error');
      }
    } catch (error: any) {
      showAlert(error?.message || 'Error updating holiday selection', 'error');
    } finally {
      setSaving(false);
    }
  };

  const HolidayTable: React.FC<{ title: string; holidays: Holiday[]; color: string; showSelection?: boolean }> = ({ title, holidays, color, showSelection = false }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Chip 
            label={showSelection ? `${tempSelectedOptional.length}/2` : holidays.length} 
            color={color as any} 
            size="small"
          />
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {showSelection && <TableCell padding="checkbox"></TableCell>}
                <TableCell><Typography variant="subtitle2" fontWeight={600}>Holiday</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" fontWeight={600}>Date</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {holidays.map((holiday) => {
                const isSelected = tempSelectedOptional.includes(holiday.id);
                const canSelect = tempSelectedOptional.length < 2 || isSelected;
                
                return (
                  <TableRow 
                    key={holiday.id}
                    hover={showSelection && canSelect}
                    sx={{
                      cursor: showSelection && canSelect ? 'pointer' : 'default',
                      bgcolor: isSelected ? `${color}.50` : 'inherit',
                      opacity: showSelection && !canSelect ? 0.6 : 1
                    }}
                    onClick={() => showSelection && canSelect && handleOptionalHolidayToggle(holiday.id)}
                  >
                    {showSelection && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          disabled={!canSelect}
                          size="small"
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {holiday.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(holiday.date)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              {holidays.length === 0 && (
                <TableRow>
                  <TableCell colSpan={showSelection ? 3 : 2} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No holidays available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {showSelection && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={saving || tempSelectedOptional.length !== 2 || JSON.stringify(tempSelectedOptional.sort()) === JSON.stringify(selectedOptional.sort())}
              size="small"
            >
              {saving ? 'Saving...' : 'Submit Selection'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );



  if (loading && (financialYears.length === 0 || !holidays)) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Financial Year</InputLabel>
          <Select
            value={selectedYear || ''}
            label="Financial Year"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {financialYears.map((fy) => (
              <MenuItem key={fy.id} value={fy.id}>
                FY {fy.year} ({fy.start_date} to {fy.end_date})
                {fy.is_active && ' - Active'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {loading && selectedYear && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {holidays && !loading && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <HolidayTable
              title="Mandatory"
              holidays={holidays.mandatory_holidays}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <HolidayTable
              title="Selected"
              holidays={holidays.selected_optional_holidays}
              color="success"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <HolidayTable
              title="Available"
              holidays={holidays.available_optional_holidays}
              color="warning"
              showSelection={true}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Holidays;