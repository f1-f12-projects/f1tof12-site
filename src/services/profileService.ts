import { Profile } from '../models/Profile';
import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';
import { cacheService } from './cacheService';

interface ProfileDateRangeData {
  profile_id: number;
  status: number;
  name: string;
  recruiter_name: string;
  requirement_id: number;
  company_name: string;
}

const CACHE_KEY = 'profiles';

export const profileService = {
  async getProfiles(): Promise<ApiResponse<Profile[]>> {
    const response: ApiResponse<Profile[]> = await apiService.get<ApiResponse<Profile[]>>(process.env.REACT_APP_PROFILE_LIST_ENDPOINT!);
    
    if (response.success) {
      cacheService.set(CACHE_KEY, response);
    }
    
    return response;
  },

  async getProfile(id: number): Promise<ApiResponse<Profile>> {
    const endpoint = process.env.REACT_APP_PROFILE_FETCH_ENDPOINT!.replace('{profile_id}', id.toString());
    return await apiService.get<ApiResponse<Profile>>(endpoint);
  },

  async getProfilesByDateRange(fromDate: string, toDate: string): Promise<ApiResponse<ProfileDateRangeData[]>> {
    const body = { start_date: fromDate, end_date: toDate };
    return await apiService.post<ApiResponse<ProfileDateRangeData[]>>(process.env.REACT_APP_PROFILE_LIST_DATE_RANGE_ENDPOING!, body);
  },

  async createProfile(profileData: Omit<Profile, 'id' | 'created_date' | 'updated_date'>): Promise<ApiResponse<Profile>> {
    const response = await apiService.post<ApiResponse<Profile>>(process.env.REACT_APP_PROFILE_ADD_ENDPOINT!, profileData);
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  async updateProfile(id: number, updateData: Partial<Profile>): Promise<ApiResponse> {
    const endpoint = process.env.REACT_APP_PROFILE_UPDATE_ENDPOINT!.replace('{profile_id}', id.toString());
    const response = await apiService.put<ApiResponse>(endpoint, updateData);
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  async updateStatus(profileId: number, statusId: number, remarks?: string): Promise<ApiResponse> {
    const endpoint = process.env.REACT_APP_PROFILE_UPDATE_STATUS_ENDPOINT!.replace('{profile_id}', profileId.toString());
    const response = await apiService.put<ApiResponse>(endpoint, {
      status: statusId,
      remarks
    });
    
    if (response.success) {
      cacheService.delete(CACHE_KEY);
    }
    
    return response;
  },

  clearCache(): void {
    cacheService.delete(CACHE_KEY);
  }
};