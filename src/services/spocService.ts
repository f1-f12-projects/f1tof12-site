import { SPOC } from '../models/SPOC';
import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';

export const spocService = {
  async getSPOCs(): Promise<ApiResponse<SPOC[]>> {
    const endpoint = process.env.REACT_APP_SPOC_LIST_ENDPOINT || '';
    return apiService.get<ApiResponse<SPOC[]>>(endpoint);
  },

  async createSPOC(spoc: Omit<SPOC, 'id'>): Promise<ApiResponse<SPOC>> {
    const endpoint = process.env.REACT_APP_SPOC_ADD_ENDPOINT || '';
    return apiService.post<ApiResponse<SPOC>>(endpoint, spoc);
  },

  async updateSPOC(id: number, updateData: Partial<Omit<SPOC, 'id'>>): Promise<ApiResponse<SPOC>> {
    let endpoint = process.env.REACT_APP_UPDATE_SPOC_ENDPOINT || '';
    endpoint = endpoint.replace('{spocId}', id.toString()).replace('{spoc_id}', id.toString());
    return apiService.put<ApiResponse<SPOC>>(endpoint, updateData);
  },
};