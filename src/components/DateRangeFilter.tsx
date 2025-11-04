import React, { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onDateRangeChange }) => {
  const [filterType, setFilterType] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const getDateRange = (type: string): DateRange => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (type) {
      case 'today':
        return { from: today, to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
      
      case 'thisWeek':
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return { from: monday, to: sunday };
      
      case 'thisMonth':
        return { 
          from: new Date(now.getFullYear(), now.getMonth(), 1),
          to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        };
      
      case 'previousMonth':
        return {
          from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
        };
      
      case 'thisYear':
        return {
          from: new Date(now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1, 3, 1),
          to: new Date(now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear(), 2, 31, 23, 59, 59, 999)
        };
      
      case 'custom':
        return {
          from: customFrom ? new Date(customFrom) : today,
          to: customTo ? new Date(customTo + 'T23:59:59') : today
        };
      
      default:
        return { from: today, to: today };
    }
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    const type = event.target.value;
    setFilterType(type);
    if (type !== 'custom') {
      onDateRangeChange(getDateRange(type));
    }
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onDateRangeChange(getDateRange('custom'));
    }
  };

  React.useEffect(() => {
    onDateRangeChange(getDateRange(filterType));
  }, [onDateRangeChange]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl fullWidth>
        <InputLabel>Date Range</InputLabel>
        <Select value={filterType} onChange={handleFilterChange} label="Date Range">
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="thisWeek">This Week</MenuItem>
          <MenuItem value="thisMonth">This Month</MenuItem>
          <MenuItem value="previousMonth">Previous Month</MenuItem>
          <MenuItem value="thisYear">This Year</MenuItem>
          <MenuItem value="custom">Custom Range</MenuItem>
        </Select>
      </FormControl>
      
      {filterType === 'custom' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="date"
            label="From Date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                padding: '12px 14px'
              }
            }}
          />
          <TextField
            type="date"
            label="To Date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                padding: '12px 14px'
              }
            }}
          />
          <Button variant="contained" onClick={handleCustomApply} fullWidth>
            Apply Date Range
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DateRangeFilter;