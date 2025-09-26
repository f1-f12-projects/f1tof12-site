import { SPOC } from '../models/SPOC';
import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';
import { cacheService } from './cacheService';

const CACHE_KEY = 'spocs';

export const spocService = {
  async getSPOCs(): Promise<ApiResponse<SPOC[]>> {
    const cached = cacheService.get(CACHE_KEY);
    if (cached) return cached;
    
    const response: ApiResponse<SPOC[]> = await apiService.get<ApiResponse<SPOC[]>>(process.env.REACT_APP_SPOC_LIST_ENDPOINT!);
    
    if (response.success) {
      cacheService.set(CACHE_KEY, response);
    }
    
    return response;
  },

  async createSPOC(spoc: Omit<SPOC, 'id'>): Promise<ApiResponse<SPOC>> {
    const response = await apiService.post<ApiResponse<SPOC>>(process.env.REACT_APP_SPOC_ADD_ENDPOINT!, spoc);
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  async updateSPOC(id: number, updateData: Partial<Omit<SPOC, 'id'>>): Promise<ApiResponse<SPOC>> {
    const endpoint = process.env.REACT_APP_UPDATE_SPOC_ENDPOINT!.replace('{spocId}', id.toString()).replace('{spoc_id}', id.toString());
    const response = await apiService.put<ApiResponse<SPOC>>(endpoint, updateData);
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  clearCache(): void {
    cacheService.delete(CACHE_KEY);
  }
};