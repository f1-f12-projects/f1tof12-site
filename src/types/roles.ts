export type UserRole = 'recruiter' | 'lead' | 'manager' | 'finance' | 'hr';

export const USER_ROLES = {
  RECRUITER: 'recruiter' as const,
  LEAD: 'lead' as const,
  MANAGER: 'manager' as const,
  FINANCE: 'finance' as const,
  HR: 'hr' as const,
} as const;