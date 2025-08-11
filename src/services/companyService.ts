import { Company } from '../models/Company';
import { apiService } from './apiService';

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    try {
      const endpoint = process.env.REACT_APP_COMPANY_LIST_ENDPOINT || '';
      const data = await apiService.get<Company[]>(endpoint);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("API fetch failed:", error);
      throw new Error('Failed to fetch companies');
    }
  },

  async registerCompany(company: Omit<Company, 'id'>): Promise<Company> {
    return apiService.post<Company>(process.env.REACT_APP_REGISTER_ENDPOINT || '', company);
  },

  async updateCompany(id: number, updates: Partial<Company>): Promise<Company> {
    return apiService.put<Company>(`${process.env.REACT_APP_COMPANY_LIST_ENDPOINT}/${id}`, updates);
  },

  async deleteCompany(id: number): Promise<void> {
    return apiService.delete<void>(`${process.env.REACT_APP_COMPANY_LIST_ENDPOINT}/${id}`);
  }
};