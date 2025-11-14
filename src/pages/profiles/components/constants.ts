export const FORM_FIELD_GROUPS = [
  {
    title: '👤 Personal Information',
    fields: [
      { field: 'name', label: 'Name', xs: 6, sm: 4 },
      { field: 'email', label: 'Email', xs: 6, sm: 4 },
      { field: 'phone', label: 'Phone', xs: 6, sm: 4 }
    ]
  },
  {
    title: '💼 Professional Background',
    fields: [
      { field: 'experience_years', label: 'Experience (Years)', type: 'number', xs: 6, sm: 3 },
      { field: 'current_employer', label: 'Current Employer', xs: 6, sm: 3 },
      { field: 'highest_education', label: 'Highest Education', xs: 6, sm: 3 },
      { field: 'skills', label: 'Technical Skills', xs: 6, sm: 3 }
    ]
  },
  {
    title: '📍 Location & Compensation',
    fields: [
      { field: 'current_location', label: 'Current Location', xs: 6, sm: 3 },
      { field: 'preferred_location', label: 'Preferred Location', xs: 6, sm: 3 },
      { field: 'current_ctc', label: 'Current CTC (₹)', type: 'number', xs: 6, sm: 3 },
      { field: 'expected_ctc', label: 'Expected CTC (₹)', type: 'number', xs: 6, sm: 3 },
      { field: 'notice_period', label: 'Notice Period', xs: 6, sm: 3 },
      { field: 'offer_in_hand', label: 'Offers In Hand', type: 'select', xs: 6, sm: 3 }
    ]
  },
  {
    title: '📄 Resume',
    fields: [
      { field: 'profile_file', label: 'Resume', type: 'file', xs: 12, sm: 12 }
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