import { Invoice } from '../models/Invoice';
import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';

export const invoiceService = {
  async getInvoices(): Promise<ApiResponse<Invoice[]>> {
    const endpoint = process.env.REACT_APP_INVOICE_LIST_ENDPOINT || '';
    return apiService.get<ApiResponse<Invoice[]>>(endpoint);
  },

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<ApiResponse<Invoice>> {
    const endpoint = process.env.REACT_APP_INVOICE_CREATE_ENDPOINT || '';
    return apiService.post<ApiResponse<Invoice>>(endpoint, invoice);
  },

  async updateInvoiceStatus(id: number, status: string): Promise<ApiResponse> {
    let endpoint = process.env.REACT_APP_UPDATE_INVOICE_ENDPOINT || '';
    endpoint = endpoint.replace('{invoiceId}', id.toString());
    return apiService.put<ApiResponse>(endpoint, { status });
  }
};