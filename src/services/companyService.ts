import { Company } from '../models/Company';
import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';
import { cacheService } from './cacheService';

const CACHE_KEY = 'companies';

export const companyService = {
  async getCompanies(): Promise<ApiResponse<Company[]>> {
    const cached = cacheService.get(CACHE_KEY);
    if (cached) return cached;
    
    const response: ApiResponse<Company[]> = await apiService.get<ApiResponse<Company[]>>(process.env.REACT_APP_COMPANY_LIST_ENDPOINT!);
    
    if (response.success) {
      cacheService.set(CACHE_KEY, response);
    }
    
    return response;
  },

  async registerCompany(company: Omit<Company, 'id'>): Promise<ApiResponse<Company>> {
    const response = await apiService.post<ApiResponse<Company>>(process.env.REACT_APP_REGISTER_ENDPOINT!, company);
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  async updateCompany(id: number, updateData: Partial<Pick<Company, 'status' | 'email_id' | 'spoc'>>): Promise<ApiResponse> {
    const endpoint = process.env.REACT_APP_UPDATE_COMPANY_ENDPOINT!.replace('{companyId}', id.toString());
    const response = await apiService.put<ApiResponse>(endpoint, updateData);
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  clearCache(): void {
    cacheService.delete(CACHE_KEY);
  }
};