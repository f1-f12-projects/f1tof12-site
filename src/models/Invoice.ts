export interface Invoice {
  id: number;
  invoice_number: string;
  po_number: string;
  company_name: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  raised_date: string;
  due_date: string;
  created_date?: string;
  updated_date?: string;
}