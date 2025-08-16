import { Invoice } from '../models/Invoice';
import { apiService } from './apiService';

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      const endpoint = process.env.REACT_APP_INVOICE_LIST_ENDPOINT || '';
      const data = await apiService.get<Invoice[]>(endpoint);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error('Failed to fetch invoices');
    }
  },

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    const endpoint = process.env.REACT_APP_CREATE_INVOICE_ENDPOINT || '';
    return apiService.post<Invoice>(endpoint, invoice);
  },

  async updateInvoiceStatus(id: number, status: string): Promise<{ message: string }> {
    let endpoint = process.env.REACT_APP_UPDATE_INVOICE_ENDPOINT || '';
    endpoint = endpoint.replace('{invoiceId}', id.toString());
    return apiService.put<{ message: string }>(endpoint, { status });
  }
};