import React from 'react';
import { Paper, Box, Typography, Chip, Stack, Card, CardContent } from '@mui/material';
import { Requirement } from '../../../models/Requirement';

interface RequirementsListProps {
  requirements: Requirement[];
  selectedRequirement: Requirement | null;
  onSelectRequirement: (requirement: Requirement) => void;
  loading: boolean;
  companyName?: string;
}

const RequirementsList: React.FC<RequirementsListProps> = ({
  requirements,
  selectedRequirement,
  onSelectRequirement,
  loading,
  companyName
}) => {
  return (
    <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', height: '800px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Open Requirements
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
          {companyName}
        </Typography>
        <Chip 
          label={requirements.length} 
          sx={{ 
            mt: 1, 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            color: 'white',
            fontWeight: 600
          }} 
        />
      </Box>
      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <Typography sx={{ textAlign: 'center', py: 4 }}>Loading...</Typography>
        ) : requirements.length > 0 ? (
          <Stack spacing={1}>
            {requirements.map((requirement) => (
              <Card 
                key={requirement.requirement_id}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: selectedRequirement?.requirement_id === requirement.requirement_id ? 2 : 1,
                  borderColor: selectedRequirement?.requirement_id === requirement.requirement_id ? 'primary.main' : 'grey.200',
                  background: selectedRequirement?.requirement_id === requirement.requirement_id 
                    ? 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)'
                    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => onSelectRequirement(requirement)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {requirement.role}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {requirement.key_skill}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label={`📍 ${requirement.location || 'Not specified'}`} 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(25, 118, 210, 0.1)', 
                            color: 'primary.main',
                            fontSize: '0.7rem'
                          }} 
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Posted {(() => {
                            const days = Math.floor((new Date().getTime() - new Date(requirement.created_date).getTime()) / (1000 * 60 * 60 * 24));
                            if (days < 7) return `${days} days ago`;
                            if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
                            return `${Math.floor(days / 30)} months ago`;
                          })()}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ color: 'text.secondary', fontSize: '1.2rem' }}>→</Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No open requirements found.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default RequirementsList;