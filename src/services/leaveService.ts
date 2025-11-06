import { apiService } from './apiService';
import { ApiResponse } from '../models/ApiResponse';

export interface Leave {
  id: number;
  username?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approver_username?: string | null;
  approver_comments?: string | null;
  created_date: string;
}

export interface LeaveBalance {
  annual_leave: number;
  sick_leave: number;
  casual_leave: number;
  total_annual: number;
  total_sick: number;
  total_casual: number;
}

export interface LeaveDashboard {
  leaves: Leave[];
  balance: LeaveBalance;
  pending_approval: {
    annual: number;
    sick: number;
    casual: number;
  };
}

export interface PendingLeave {
  id: number;
  username: string;
  given_name: string | null;
  family_name: string | null;
  annual_leave: number;
  sick_leave: number;
  casual_leave: number;
  year: number;
  created_date: string;
  updated_date: string;
}

export const leaveService = {
  getLeaveDashboard: async (): Promise<ApiResponse<LeaveDashboard>> => {
    return apiService.get(process.env.REACT_APP_GET_LEAVE_DASHBOARD_ENDPOINT!);
  },

  approveRejectLeave: async (leaveId: number, action: 'approve' | 'reject', comments?: string): Promise<ApiResponse<any>> => {
    return apiService.post('/leaves/review', {
      leave_id: leaveId,
      action,
      comments
    });
  },

  applyLeave: async (leaveData: { start_date: string; end_date: string; leave_type: string; reason: string; }): Promise<ApiResponse<any>> => {
    return apiService.post(process.env.REACT_APP_GET_APPLY_LEAVES_ENDPOINT!, leaveData);
  },

  allocateLeaveBalance: async (username: string, leaveBalances: { annual_leave?: number; sick_leave?: number; casual_leave?: number }): Promise<ApiResponse<any>> => {
    return apiService.post(process.env.REACT_APP_ALLOCATE_LEAVE_BALANCE_ENDPOINT!, {
      username,
      ...leaveBalances
    });
  },

  getPendingLeaves: async (): Promise<ApiResponse<PendingLeave[]>> => {
    return apiService.get(process.env.REACT_APP_PENDING_LEAVES_ENDPOINT!);
  },

  getAllLeaves: async (): Promise<ApiResponse<Leave[]>> => {
    return apiService.get(process.env.REACT_APP_ALL_LEAVES_ENDPOINT!);
  }
};