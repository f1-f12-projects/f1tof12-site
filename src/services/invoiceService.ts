import { Invoice } from '../models/Invoice';
import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';
import { cacheService } from './cacheService';

const CACHE_KEY = 'invoices';

export const invoiceService = {
  async getInvoices(): Promise<ApiResponse<Invoice[]>> {
    const cached = cacheService.get(CACHE_KEY);
    if (cached) return cached;
    
    const response: ApiResponse<Invoice[]> = await apiService.get<ApiResponse<Invoice[]>>(process.env.REACT_APP_INVOICE_LIST_ENDPOINT!);
    
    if (response.success) {
      cacheService.set(CACHE_KEY, response);
    }
    
    return response;
  },

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<ApiResponse<Invoice>> {
    const response = await apiService.post<ApiResponse<Invoice>>(process.env.REACT_APP_INVOICE_CREATE_ENDPOINT!, invoice);
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  async updateInvoiceStatus(id: number, status: string): Promise<ApiResponse> {
    const endpoint = process.env.REACT_APP_INVOICE_UPDATE_ENDPOINT!.replace('{invoice_id}', id.toString());
    const response = await apiService.put<ApiResponse>(endpoint, { status });
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  clearCache(): void {
    cacheService.delete(CACHE_KEY);
  }
};