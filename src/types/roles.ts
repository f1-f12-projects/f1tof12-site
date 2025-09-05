export type UserRole = 'recruiter' | 'lead' | 'manager' | 'finance';

export const USER_ROLES = {
  RECRUITER: 'recruiter' as const,
  LEAD: 'lead' as const,
  MANAGER: 'manager' as const,
  FINANCE: 'finance' as const,
} as const;