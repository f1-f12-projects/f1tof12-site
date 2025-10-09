export const FORM_FIELDS = [
  { field: 'name', label: 'Name', xs: 12, sm: 4 },
  { field: 'email', label: 'Email', xs: 12, sm: 4 },
  { field: 'phone', label: 'Phone', xs: 12, sm: 4 },
  { field: 'experience_years', label: 'Experience (Years)', type: 'number', xs: 12, sm: 4 },
  { field: 'current_location', label: 'Current Location', xs: 12, sm: 4 },
  { field: 'preferred_location', label: 'Preferred Location', xs: 12, sm: 4 },
  { field: 'current_ctc', label: 'Current CTC (₹)', type: 'number', xs: 12, sm: 6 },
  { field: 'expected_ctc', label: 'Expected CTC (₹)', type: 'number', xs: 12, sm: 6 },
  { field: 'skills', label: 'Technical Skills', xs: 12, sm: 6 },
  { field: 'notice_period', label: 'Notice Period', xs: 12, sm: 6 }
];

export const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '&.Mui-focused fieldset': {
      borderColor: '#6366f1'
    }
  }
};