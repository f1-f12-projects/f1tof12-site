export interface Requirement {
  requirement_id: number;
  created_date: string;
  company_id: number;
  company_name?: string;
  key_skill: string;
  jd: string;
  status_id: number;
  status?: string;
  recruiter_name: string;
  closed_date?: string;
  budget?: number;
  expected_billing_date: string;
  remarks?: string;
  req_cust_ref_id?: string;
  updated_date?: string;
  location: string;
  role: string;
  spoc_id: number;
}