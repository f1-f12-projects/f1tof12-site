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
    const endpoint = process.env.REACT_APP_REGISTER_ENDPOINT || '';
    return apiService.post<Company>(endpoint, company);
  },

  async updateCompany(id: number, updateData: { status?: string; email_id?: string; spoc?: string }): Promise<{ message: string }> {
    let endpoint = process.env.REACT_APP_UPDATE_COMPANY_ENDPOINT || '';
    console.log ('Updates to: ', updateData);
    endpoint = endpoint.replace('{companyId}', id.toString());
    console.log(`Final endpoint: ${endpoint}`);
    return apiService.put<{ message: string }>(endpoint, updateData);
  }

};