import { UserResponse } from '../models/User';
import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';

export const userService = {
  async getUsers(): Promise<ApiResponse<UserResponse>> {
    return apiService.get(process.env.REACT_APP_USERS_ENDPOINT || '');
  },

  async enableUser(userId: string): Promise<ApiResponse> {
    return apiService.post(process.env.REACT_APP_USER_ENABLE_ENDPOINT?.replace('{target_username}', userId) || '', {});
  },

  async disableUser(userId: string): Promise<ApiResponse> {
    return apiService.post(process.env.REACT_APP_USER_DISABLE_ENDPOINT?.replace('{target_username}', userId) || '', {});
  },

  async createUser(userData: { given_name: string; family_name: string; username: string; email: string; phone_number: string; temporary_password: string; role: string }): Promise<ApiResponse> {
    return apiService.post(process.env.REACT_APP_USER_CREATE_ENDPOINT || '', userData);
  },

  async updateUser(username: string, userData: Partial<{ given_name: string; family_name: string; email: string; phone_number: string; role: string }>): Promise<ApiResponse> {
    return apiService.put(process.env.REACT_APP_USER_UPDATE_ENDPOINT?.replace('{target_username}', username) || ``, userData);
  },

  async resetPassword(username: string, newTemporaryPassword: string): Promise<ApiResponse> {
    return apiService.post(process.env.REACT_APP_USER_RESET_PASSWORD_ENDPOINT?.replace('{target_username}', username) || '', {
      new_temporary_password: newTemporaryPassword
    });
  }
};