import { Requirement } from '../models/Requirement';
import { RequirementStatus } from '../models/RequirementStatus';
import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';
import { cacheService } from './cacheService';

const CACHE_KEY = 'requirements';
const STATUSES_CACHE_KEY = 'requirement_statuses';

export const requirementService = {
  async getRequirements(): Promise<ApiResponse<Requirement[]>> {
    const response: ApiResponse<Requirement[]> = await apiService.get<ApiResponse<Requirement[]>>(process.env.REACT_APP_REQUIREMENTS_LIST_ENDPOINT!);
    
    if (response.success) {
      cacheService.set(CACHE_KEY, response);
    }
    
    return response;
  },

  async getRequirement(id: number): Promise<ApiResponse<Requirement>> {
    const endpoint = process.env.REACT_APP_REQUIREMENTS_FETCH_ENDPOINT!.replace('{requirement_id}', id.toString());
    return await apiService.get<ApiResponse<Requirement>>(endpoint);
  },

  async getRequirementStatuses(): Promise<RequirementStatus[]> {
    const cached = cacheService.get(STATUSES_CACHE_KEY);
    if (cached) return cached as RequirementStatus[];
    
    try {
      const response = await apiService.get<ApiResponse<RequirementStatus[]>>(process.env.REACT_APP_REQUIREMENTS_STATUSES_ENDPOINT!);
      
      if (response.success && response.data) {
        cacheService.set(STATUSES_CACHE_KEY, response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching requirement statuses:', error);
    }
    
    return [];
  },

  async updateRequirement(id: number, updateData: Partial<Pick<Requirement, 'status_id' | 'expected_billing_date' | 'recruiter_name' | 'closed_date' | 'budget' | 'remarks' | 'location'>>): Promise<ApiResponse> {
    const endpoint = process.env.REACT_APP_REQUIREMENTS_UPDATE_ENDPOINT!.replace('{requirement_id}', id.toString());
    const response = await apiService.put<ApiResponse>(endpoint, updateData);
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  async updateRequirementStatus(id: number, status_id: number, remarks?: string): Promise<ApiResponse> {
    const endpoint = process.env.REACT_APP_REQUIREMENTS_UPDATE_STATUS_ENDPOINT!.replace('{requirement_id}', id.toString());
    const payload: { status_id: number; remarks?: string } = { status_id };
    if (remarks) payload.remarks = remarks;
    const response = await apiService.put<ApiResponse>(endpoint, payload);
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  clearCache(): void {
    cacheService.delete(CACHE_KEY);
  }
};