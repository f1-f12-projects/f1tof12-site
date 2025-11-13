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
  highest_education?: string | null;
  current_employer?: string | null;
  offer_in_hand?: boolean | null;
  accepted_offer?: number | null;
  joining_date?: string | null;
  remarks?: string | null;
  status?: number;
  created_date?: string;
  updated_date?: string;
}