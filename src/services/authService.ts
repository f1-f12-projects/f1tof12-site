import { ApiResponse } from '../models/ApiResponse';
import { apiService } from './apiService';
import { UserRole } from '../types/roles';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  status_code: number;
  role: UserRole;
  userData?: {
    profileId: string;
    givenName: string;
    familyName: string;
  };
}

interface PasswordChangeRequest {
  username: string;
  temporary_password: string;
  new_password: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiService.post(process.env.REACT_APP_LOGIN_ENDPOINT || '', credentials);
  },

  async changePassword(data: PasswordChangeRequest): Promise<ApiResponse> {
    return apiService.post(process.env.REACT_APP_USER_CHANGE_PASSWORD_ENDPOINT || '', data);
  },

  async refreshToken(refreshToken: string, username: string): Promise<ApiResponse<LoginResponse>> {
    return apiService.post(process.env.REACT_APP_REFRESH_TOKEN_ENDPOINT || '', { refresh_token: refreshToken, username });
  }
};