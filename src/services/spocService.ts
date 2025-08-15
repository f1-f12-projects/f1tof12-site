import { SPOC } from '../models/SPOC';
import { apiService } from './apiService';

export const spocService = {
  async getSPOCs(): Promise<SPOC[]> {
    const endpoint = process.env.REACT_APP_SPOC_LIST_ENDPOINT || '';
    return apiService.get<SPOC[]>(endpoint);
  },

  async createSPOC(spoc: Omit<SPOC, 'id'>): Promise<SPOC> {
    const endpoint = process.env.REACT_APP_SPOC_ADD_ENDPOINT || '';
    return apiService.post<SPOC>(endpoint, spoc);
  },

  async updateSPOC(id: number, updateData: Partial<Omit<SPOC, 'id'>>): Promise<SPOC> {
    const endpoint = process.env.REACT_APP_UPDATE_SPOC_ENDPOINT?.replace('{spocId}', id.toString()) || '';
    return apiService.put<SPOC>(endpoint, updateData);
  },
};