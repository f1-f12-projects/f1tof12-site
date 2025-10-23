import { UserResponse } from '../models/User';
import { ApiResponse } from '../models/ApiResponse';
import { User } from '../models/User';
import { apiService } from './apiService';
import { cacheService } from './cacheService';

const USERS_CACHE_KEY = 'users';
const USER_CACHE_PREFIX = 'user_';

cacheService.configure({
  [USERS_CACHE_KEY]: { ttl: 5 * 60 * 1000, persistent: false },
  [USER_CACHE_PREFIX]: { ttl: 5 * 60 * 1000, persistent: false }
});

export const userService = {
  async getUsers(clearCache = false): Promise<ApiResponse<UserResponse>> {
    if (clearCache) {
      cacheService.delete(USERS_CACHE_KEY);
    }
    
    const cached = cacheService.get(USERS_CACHE_KEY) as ApiResponse<UserResponse> | null;
    if (cached) return cached;
    
    const response = await apiService.get<ApiResponse<UserResponse>>(process.env.REACT_APP_USERS_ENDPOINT!);
    if (response.success) {
      cacheService.set(USERS_CACHE_KEY, response);
    }
    return response;
  },

  async enableUser(userId: string): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(process.env.REACT_APP_USER_ENABLE_ENDPOINT?.replace('{target_username}', userId) || '', {});
    if (response.success) cacheService.delete(USERS_CACHE_KEY);
    return response;
  },

  async disableUser(userId: string): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(process.env.REACT_APP_USER_DISABLE_ENDPOINT?.replace('{target_username}', userId) || '', {});
    if (response.success) cacheService.delete(USERS_CACHE_KEY);
    return response;
  },

  async createUser(userData: { given_name: string; family_name: string; username: string; email: string; phone_number: string; temporary_password: string; role: string }): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(process.env.REACT_APP_USER_CREATE_ENDPOINT || '', userData);
    if (response.success) cacheService.delete(USERS_CACHE_KEY);
    return response;
  },

  async updateUser(username: string, userData: Partial<{ given_name: string; family_name: string; email: string; phone_number: string; role: string }>): Promise<ApiResponse> {
    const response = await apiService.put<ApiResponse>(process.env.REACT_APP_USER_UPDATE_ENDPOINT?.replace('{target_username}', username) || ``, userData);
    if (response.success) cacheService.delete(USERS_CACHE_KEY);
    return response;
  },

  async resetPassword(username: string, newTemporaryPassword: string): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(process.env.REACT_APP_USER_RESET_PASSWORD_ENDPOINT?.replace('{target_username}', username) || '', {
      new_temporary_password: newTemporaryPassword
    });
    if (response.success) cacheService.delete(USERS_CACHE_KEY);
    return response;
  },

  async getUserDetails(username: string): Promise<User | null> {
    const cacheKey = `${USER_CACHE_PREFIX}${username}`;
    const cached = cacheService.get(cacheKey) as User | null;
    if (cached) return cached;
    
    const response = await apiService.get<ApiResponse>(process.env.REACT_APP_GET_USER_ENDPOINT?.replace('{user_name}', username) || '');
    if (response.success && response.data) {
      cacheService.set(cacheKey, response.data);
      return response.data;
    }
    return null;
  },

  async getUserName(username: string): Promise<{ given_name: string | null; family_name: string | null } | null> {
    const usersResponse = await this.getUsers();
    if (usersResponse.success && usersResponse.data) {
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.users;
      if (users) {
        const user = users.find(u => u.username === username);
        return user ? { given_name: user.given_name, family_name: user.family_name } : null;
      }
    }
    return null;
  }
};