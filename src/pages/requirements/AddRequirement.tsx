import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box, MenuItem, Card, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { requirementService } from '../../services/requirementService';
import { companyService } from '../../services/companyService';
import { spocService } from '../../services/spocService';
import { Company } from '../../models/Company';
import { SPOC } from '../../models/SPOC';
import { alert } from '../../utils/alert';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { handleApiResponse } from '../../utils/apiHandler';

interface RequirementForm {
  key_skill: string;
  jd: string;
  company_id: number | '';
  spoc_id: number | '';
  experience_level: string;
  location: string;
  budget: number | '';
  expected_billing_date: string;
  req_cust_ref_id: string;
}

interface FormErrors {
  key_skill?: string;
  jd?: string;
  company_id?: string;
  spoc_id?: string;
  experience_level?: string;
  location?: string;
  budget?: string;
  expected_billing_date?: string;
  req_cust_ref_id?: string;
}

const AddRequirement: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuthentication } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredSpocs, setFilteredSpocs] = useState<SPOC[]>([]);
  const [successDialog, setSuccessDialog] = useState<{ open: boolean; requirementId?: string }>({ open: false });
  
  const [form, setForm] = useState<RequirementForm>({
    key_skill: '',
    jd: '',
    company_id: '',
    spoc_id: '',
    experience_level: '',
    location: '',
    budget: '',
    expected_billing_date: '',
    req_cust_ref_id: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const initializeAuth = async () => {
      const authenticated = await checkAuthentication();
      if (!authenticated) {
        alert.error('Please login to access this page');
        navigate('/');
        return;
      }
      
      await loadData();
    };
    
    initializeAuth();
  }, [checkAuthentication, navigate]);

  useEffect(() => {
    if (form.company_id) {
      loadSPOCsByCompany(Number(form.company_id));
      setForm(prev => ({ ...prev, spoc_id: '' }));
    } else {
      setFilteredSpocs([]);
    }
  }, [form.company_id]);

  const loadData = async () => {
    await handleApiResponse(
      () => companyService.getCompanies(),
      (response) => setCompanies((response || []).filter(c => c.status === 'active')),
      () => alert.error('Failed to load companies')
    );
  };

  const loadSPOCsByCompany = async (companyId: number) => {
    await handleApiResponse(
      () => spocService.getSPOCsByCompany(companyId),
      (response) => setFilteredSpocs((response || []).filter(s => s.status === 'active')),
      () => alert.error('Failed to load SPOCs')
    );
  };

  const handleInputChange = (field: keyof RequirementForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const fieldStyle = { '& .MuiOutlinedInput-root': { borderRadius: 3 } };
  
  const getFieldProps = (field: keyof FormErrors, required = false) => ({
    error: !!errors[field],
    helperText: errors[field],
    required,
    sx: fieldStyle
  });

  const fields = [
    { key: 'key_skill', label: 'Key Skill', required: true },
    { key: 'company_id', label: 'Company', required: true, type: 'select', options: companies.map(c => ({ value: c.id, label: c.name })) },
    { key: 'spoc_id', label: 'SPOC', type: 'select', options: filteredSpocs.map(s => ({ value: s.id, label: s.name })), disabled: !form.company_id },
    { key: 'experience_level', label: 'Experience Level', required: true },
    { key: 'location', label: 'Location', required: true },
    { key: 'budget', label: 'Budget', type: 'number' },
    { key: 'expected_billing_date', label: 'Expected Billing Date', type: 'date' },
    { key: 'req_cust_ref_id', label: 'Customer Reference ID' }
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: FormErrors = {};
    if (!form.key_skill) newErrors.key_skill = 'Key skill is required';
    if (!form.jd) newErrors.jd = 'Job description is required';
    if (!form.company_id) newErrors.company_id = 'Company is required';
    if (!form.experience_level) newErrors.experience_level = 'Experience level is required';
    if (!form.location) newErrors.location = 'Location is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});

    setLoading(true);
    
    const submitData: any = {
      key_skill: form.key_skill,
      jd: form.jd,
      company_id: Number(form.company_id),
      experience_level: form.experience_level,
      location: form.location,
      expected_billing_date: form.expected_billing_date || new Date().toISOString().split('T')[0],
      status_id: 1,
      created_date: new Date().toISOString()
    };
    
    if (form.spoc_id) submitData.spoc_id = Number(form.spoc_id);
    if (form.budget) submitData.budget = Number(form.budget);
    if (form.req_cust_ref_id) submitData.req_cust_ref_id = form.req_cust_ref_id;

    const response = await requirementService.createRequirement(submitData);
    if (response.success && response.data) {
      setSuccessDialog({ open: true, requirementId: String(response.data.requirement_id) });
    } else {
      alert.error('Failed to create requirement');
    }
    
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <PageHeader 
            title="Add New Requirement" 
            subtitle="Create a new job requirement"
          />
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/requirements')}
            sx={{ borderRadius: 3, m: 2 }}
          >
            Back to Requirements
          </Button>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ p: 4 }}>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            {fields.map(field => {
              const isRequired = 'required' in field && field.required;
              return (
                <TextField
                  key={field.key}
                  required={isRequired}
                  error={!!errors[field.key as keyof FormErrors]}
                  helperText={errors[field.key as keyof FormErrors]}
                  sx={fieldStyle}
                  label={field.label}
                  type={'type' in field ? field.type : undefined}
                  select={'type' in field && field.type === 'select'}
                  disabled={'disabled' in field ? field.disabled : false}
                  value={form[field.key as keyof RequirementForm]}
                  onChange={(e) => handleInputChange(field.key as keyof RequirementForm, ('type' in field && field.type === 'number') || field.key.includes('_id') ? Number(e.target.value) : e.target.value)}
                  InputLabelProps={'type' in field && field.type === 'date' ? { shrink: true } : undefined}
                >
                  {'options' in field && field.options?.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              );
            })}
          </Box>

          <TextField
            {...getFieldProps('jd', true)}
            multiline
            rows={4}
            label="Job Description"
            value={form.jd}
            onChange={(e) => handleInputChange('jd', e.target.value)}
            fullWidth
            sx={{ mt: 3, ...fieldStyle }}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/requirements')}
              sx={{ borderRadius: 3 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading}
              sx={{ borderRadius: 3 }}
            >
              {loading ? 'Creating...' : 'Create Requirement'}
            </Button>
          </Box>
        </Box>
      </Card>
      
      <Dialog open={successDialog.open} onClose={() => setSuccessDialog({ open: false })}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>
            Requirement created successfully! Requirement ID: {successDialog.requirementId}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSuccessDialog({ open: false }); navigate('/requirements'); }} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddRequirement;