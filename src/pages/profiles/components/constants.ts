export const FORM_FIELD_GROUPS = [
  {
    title: '👤 Personal Information',
    fields: [
      { field: 'name', label: 'Name', xs: 12, sm: 4 },
      { field: 'email', label: 'Email', xs: 12, sm: 4 },
      { field: 'phone', label: 'Phone', xs: 12, sm: 4 }
    ]
  },
  {
    title: '💼 Professional Background',
    fields: [
      { field: 'experience_years', label: 'Experience (Years)', type: 'number', xs: 12, sm: 6 },
      { field: 'current_employer', label: 'Current Employer', xs: 12, sm: 6 },
      { field: 'highest_education', label: 'Highest Education', xs: 12, sm: 6 },
      { field: 'skills', label: 'Technical Skills', xs: 12, sm: 6 }
    ]
  },
  {
    title: '📍 Location Preferences',
    fields: [
      { field: 'current_location', label: 'Current Location', xs: 12, sm: 6 },
      { field: 'preferred_location', label: 'Preferred Location', xs: 12, sm: 6 }
    ]
  },
  {
    title: '💰 Compensation & Status',
    fields: [
      { field: 'current_ctc', label: 'Current CTC (₹)', type: 'number', xs: 12, sm: 6 },
      { field: 'expected_ctc', label: 'Expected CTC (₹)', type: 'number', xs: 12, sm: 6 },
      { field: 'notice_period', label: 'Notice Period', xs: 12, sm: 6 },
      { field: 'offer_in_hand', label: 'Offers In Hand', type: 'select', xs: 12, sm: 6 }
    ]
  }
];

export const FORM_FIELDS = FORM_FIELD_GROUPS.flatMap(group => group.fields);

export const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main'
    }
  }
};