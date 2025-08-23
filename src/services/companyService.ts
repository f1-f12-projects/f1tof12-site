import { Company } from '../models/Company';
import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';

export const companyService = {
  async getCompanies(): Promise<ApiResponse<Company[]>> {
    const endpoint = process.env.REACT_APP_COMPANY_LIST_ENDPOINT || '';
    return apiService.get<ApiResponse<Company[]>>(endpoint);
  },

  async registerCompany(company: Omit<Company, 'id'>): Promise<ApiResponse<Company>> {
    const endpoint = process.env.REACT_APP_REGISTER_ENDPOINT || '';
    return apiService.post<ApiResponse<Company>>(endpoint, company);
  },

  async updateCompany(id: number, updateData: { status?: string; email_id?: string; spoc?: string }): Promise<ApiResponse> {
    let endpoint = process.env.REACT_APP_UPDATE_COMPANY_ENDPOINT || '';
    endpoint = endpoint.replace('{companyId}', id.toString());
    return apiService.put<ApiResponse>(endpoint, updateData);
  }

};