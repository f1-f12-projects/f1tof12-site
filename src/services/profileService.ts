import { Profile } from '../models/Profile';
import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';
import { cacheService } from './cacheService';

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

  async createProfile(profileData: Omit<Profile, 'id' | 'created_date' | 'updated_date'>): Promise<ApiResponse<Profile>> {
    console.log (profileData);
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

  clearCache(): void {
    cacheService.delete(CACHE_KEY);
  }
};