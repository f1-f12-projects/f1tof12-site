import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Grid } from '@mui/material';
import { Company } from '../../models/Company';
import { Requirement } from '../../models/Requirement';
import { Profile } from '../../models/Profile';
import { ProfileStatus } from '../../models/ProfileStatus';
import { companyService } from '../../services/companyService';
import { requirementService } from '../../services/requirementService';
import { profileService } from '../../services/profileService';
import { showAlert } from '../../utils/alert';
import PageHeader from '../../components/PageHeader';

import CompanyCard from './components/CompanyCard';
import RequirementsList from './components/RequirementsList';
import ProfileDashboard from './components/ProfileDashboard';
import AddProfileDialog from './components/AddProfileDialog';

const ProcessProfiles: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience_years: '',
    current_location: '',
    preferred_location: '',
    current_ctc: '',
    expected_ctc: '',
    notice_period: ''
  });
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleBlur = (field: string) => {
    if (formData[field as keyof typeof formData].trim()) {
      setErrors(prev => ({...prev, [field]: false}));
    }
  };

  const handleAddProfile = async () => {
    if (!selectedRequirement) {
      showAlert('Please select a requirement first', 'error');
      return;
    }

    // Validate all required fields
    const requiredFields = ['name', 'email', 'phone', 'skills', 'experience_years', 'current_location', 'preferred_location', 'current_ctc', 'expected_ctc', 'notice_period'];
    const newErrors: {[key: string]: boolean} = {};
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData].trim()) {
        newErrors[field] = true;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setSubmitting(true);
    try {
      const payload: Omit<Profile, 'id' | 'created_date' | 'updated_date'> & { requirement_id: number } = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
        current_ctc: formData.current_ctc ? parseFloat(formData.current_ctc) : null,
        expected_ctc: formData.expected_ctc ? parseFloat(formData.expected_ctc) : null,
        notice_period: formData.notice_period || null,
        requirement_id: selectedRequirement.requirement_id
      };
      
      const response = await profileService.createProfile(payload);
      
      if (response.success) {
        showAlert('Profile added successfully', 'success');
        setShowAddForm(false);
        setFormData({
          name: '', email: '', phone: '', skills: '', experience_years: '',
          current_location: '', preferred_location: '', current_ctc: '',
          expected_ctc: '', notice_period: ''
        });
        setErrors({});
      } else {
        showAlert('Failed to add profile', 'error');
      }
    } catch (error) {
      showAlert('Error adding profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadRequirements();
    } else {
      setRequirements([]);
    }
  }, [selectedCompanyId]);

  const getTopCompanies = (companies: Company[]): Company[] => {
    // Dummy logic - will be replaced later
    return companies.slice(0, 3);
  };

  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies();
      if (response.success && response.data) {
        const activeCompanies = response.data.filter(company => company.status === 'active');
        setCompanies(getTopCompanies(activeCompanies));
      }
    } catch (error) {
      showAlert('Failed to load companies', 'error');
    }
  };

  const loadRequirements = async () => {
    setLoading(true);
    try {
      const response = await requirementService.getRequirements();
      if (response.success && response.data) {
        const openRequirements = response.data.filter(
          req => req.company_id === selectedCompanyId && req.status_id !== 4 // Assuming status_id 4 is closed
        );
        setRequirements(openRequirements);
      }
    } catch (error) {
      showAlert('Failed to load requirements', 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <PageHeader title="Recruiter's Dashboard" />
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
            🏢 Companies
          </Typography>
          <Grid container spacing={3}>
            {companies.map((company) => (
              <Grid item xs={12} md={4} key={company.id}>
                <CompanyCard
                  company={company}
                  isSelected={selectedCompanyId === company.id}
                  onSelect={setSelectedCompanyId}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {selectedCompanyId && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <RequirementsList
                requirements={requirements}
                selectedRequirement={selectedRequirement}
                onSelectRequirement={setSelectedRequirement}
                loading={loading}
                companyName={companies.find(c => c.id === selectedCompanyId)?.name}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <ProfileDashboard
                selectedRequirement={selectedRequirement}
                onAddProfile={() => setShowAddForm(true)}
              />
            </Grid>
          </Grid>
        )}
      </Paper>
      
      <AddProfileDialog
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        formData={formData}
        errors={errors}
        submitting={submitting}
        onInputChange={handleInputChange}
        onBlur={handleBlur}
        onSubmit={handleAddProfile}
      />
    </Container>
  );
};

export default ProcessProfiles;