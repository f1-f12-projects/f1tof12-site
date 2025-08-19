import { UserResponse } from '../models/User';
import { apiService } from './apiService';

export const userService = {
  async getUsers(): Promise<UserResponse> {
    return apiService.get(process.env.REACT_APP_USERS_ENDPOINT || '');
  },

  async enableUser(userId: string): Promise<void> {
    return apiService.post(process.env.REACT_APP_USER_ENABLE_ENDPOINT?.replace('{target_username}', userId) || '', {});
  },

  async disableUser(userId: string): Promise<void> {
    return apiService.post(process.env.REACT_APP_USER_DISABLE_ENDPOINT?.replace('{target_username}', userId) || '', {});
  },

  async createUser(userData: { username: string; email: string; phone_number: string; temporary_password: string }): Promise<{ message: string }> {
    return apiService.post(process.env.REACT_APP_USER_CREATE_ENDPOINT || '/admin/users', userData);
  }
};