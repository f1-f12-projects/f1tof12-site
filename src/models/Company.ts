export interface Company {
  id: number;
  name: string;
  spoc: string;
  email_id: string;
  status: 'active' | 'inactive';
  created_date?: string;
  updated_date?: string;
}