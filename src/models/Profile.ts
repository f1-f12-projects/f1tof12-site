export interface Profile {
  id?: number;
  name: string;
  email: string;
  phone: string;
  skills: string;
  experience_years: number;
  current_location: string;
  preferred_location: string;
  current_ctc?: number | null;
  expected_ctc?: number | null;
  notice_period?: string | null;
  created_date?: string;
  updated_date?: string;
}