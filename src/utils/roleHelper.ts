import { UserRole, USER_ROLES } from '../types/roles';

export const roleHelper = {
  canAccessPage: (userRole: UserRole, page: string): boolean => {
    const pagePermissions: Record<string, UserRole[]> = {
      '/companies': [USER_ROLES.MANAGER],
      '/candidates': [USER_ROLES.RECRUITER, USER_ROLES.LEAD, USER_ROLES.MANAGER],
      '/interviews': [USER_ROLES.RECRUITER, USER_ROLES.LEAD, USER_ROLES.MANAGER],
      '/reports': [USER_ROLES.LEAD, USER_ROLES.MANAGER, USER_ROLES.FINANCE],
      '/company/invoices': [USER_ROLES.FINANCE, USER_ROLES.MANAGER],
      '/admin': [USER_ROLES.MANAGER],
    };

    return pagePermissions[page]?.includes(userRole) ?? false;
  },

  getDefaultRoute: (userRole: UserRole): string => {
    const defaultRoutes: Record<UserRole, string> = {
      [USER_ROLES.RECRUITER]: '/candidates',
      [USER_ROLES.LEAD]: '/interviews',
      [USER_ROLES.MANAGER]: '/reports',
      [USER_ROLES.FINANCE]: '/company/invoices',
    };

    return defaultRoutes[userRole] || '/';
  },

  getVisibleMenuItems: (userRole: UserRole): string[] => {
    const menuItems: Record<UserRole, string[]> = {
      [USER_ROLES.RECRUITER]: ['/candidates', '/interviews'],
      [USER_ROLES.LEAD]: ['/candidates', '/interviews'],
      [USER_ROLES.MANAGER]: ['/companies', '/candidates', '/interviews', '/reports', '/company/invoices', '/admin'],
      [USER_ROLES.FINANCE]: ['/company/invoices'],
    };

    return menuItems[userRole] || [];
  },
};