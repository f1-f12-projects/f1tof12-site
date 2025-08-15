export interface SPOC {
  id: number;
  name: string;
  email_id: string;
  phone?: string;
  company_id: number;
  location?: string;
  status: 'active' | 'inactive';
}