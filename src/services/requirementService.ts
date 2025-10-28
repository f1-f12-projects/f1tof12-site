import { Requirement } from '../models/Requirement';
import { RequirementStatus } from '../models/RequirementStatus';
import { ApiResponse } from '../models/ApiResponse';
import { Profile } from '../models/Profile';
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

  async getOpenRequirements(company_id: number): Promise<ApiResponse<Requirement[]>> {
    const endpoint = process.env.REACT_APP_REQUIREMENTS_GET_OPEN_BY_COMPANY_ENDPOINT!.replace('{company_id}', company_id.toString());
    return await apiService.get<ApiResponse<Requirement[]>>(endpoint);
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

  async assignRecruiter(id: number, recruiter_name: string): Promise<ApiResponse> {
    const endpoint = process.env.REACT_APP_REQUIREMENTS_ASSIGN_RECRUITER_ENDPOINT!.replace('{requirement_id}', id.toString());
    const response = await apiService.put<ApiResponse>(endpoint, { recruiter_name });
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  async createRequirement(requirementData: Omit<Requirement, 'requirement_id' | 'company_name' | 'status' | 'recruiter_name' | 'closed_date' | 'remarks' | 'updated_date'> & { spoc_id?: number }): Promise<ApiResponse<Requirement>> {
    const response = await apiService.post<ApiResponse<Requirement>>(process.env.REACT_APP_REQUIREMENTS_ADD_ENDPOINT!, requirementData);
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  async getRecruiterNames(requirement_id: number): Promise<string[]> {
    try {
      const endpoint = process.env.REACT_APP_REQUIREMENTS_GET_RECRUITER_ASSIGNED_ENDPOINT!.replace('{requirement_id}', requirement_id.toString());
      const response = await apiService.get<ApiResponse<string[]>>(endpoint);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error fetching recruiter names:', error);
      return [];
    }
  },

  async changeWorkingStatus(requirement_id: number, recruiter_name: string, actively_working: string): Promise<ApiResponse> {
    const endpoint = process.env.REACT_APP_REQUIREMENT_CHANGE_WORKING_STATUS_ENDPOINT!
      .replace('{requirement_id}', requirement_id.toString())
      .replace('{recruiter_name}', recruiter_name);
    return await apiService.put<ApiResponse>(endpoint, { actively_working });
  },

  async addComment(requirement_id: number, comment: string): Promise<ApiResponse> {
    const endpoint = process.env.REACT_APP_REQUIREMENTS_ADD_COMMENT_ENDPOINT!.replace('{requirement_id}', requirement_id.toString());
    return await apiService.put<ApiResponse>(endpoint, { remarks: comment });
  },

  async getProfileCounts(requirement_id: number): Promise<ApiResponse<Record<string, number>>> {
    const endpoint = process.env.REACT_APP_REQUIREMENTS_GET_PROFILE_COUNTS_ENDPOINT!.replace('{requirement_id}', requirement_id.toString());
    return await apiService.get<ApiResponse<Record<string, number>>>(endpoint);
  },

  async getProfilesByStage(requirement_id: number, stage: string): Promise<ApiResponse<(Profile & { stage: string })[]>> {
    const endpoint = process.env.REACT_APP_REQUIREMENTS_GET_PROFILE_STAGE_ENDPOINT!
      .replace('{requirement_id}', requirement_id.toString())
      .replace('{stage}', stage);
    return await apiService.get<ApiResponse<(Profile & { stage: string })[]>>(endpoint);
  },

  clearCache(): void {
    cacheService.delete(CACHE_KEY);
  }
};