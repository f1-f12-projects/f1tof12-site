import React from 'react';
import { Card, CardContent, Stack, Avatar, Box, Typography } from '@mui/material';
import { Company } from '../../../models/Company';

interface CompanyCardProps {
  company: Company;
  isSelected: boolean;
  onSelect: (companyId: number) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, isSelected, onSelect }) => {
  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: isSelected ? 2 : 0,
        borderColor: 'primary.main',
        background: isSelected 
          ? 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: isSelected ? 4 : 2,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
      onClick={() => onSelect(company.id)}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            sx={{ 
              bgcolor: isSelected ? 'primary.main' : 'secondary.main',
              width: 56, 
              height: 56,
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            {company.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {company.name}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;