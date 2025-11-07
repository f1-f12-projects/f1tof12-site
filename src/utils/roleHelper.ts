import { UserRole, USER_ROLES } from '../types/roles';

const rolePermissions: Record<UserRole, string[]> = {
  [USER_ROLES.RECRUITER]: ['/profiles', '/reports', '/reports/profiles'],
  [USER_ROLES.LEAD]: ['/profiles', '/requirements', '/reports', '/reports/profiles'],
  [USER_ROLES.FINANCE]: ['/company/invoices', '/reports', '/reports/invoices'],
  [USER_ROLES.MANAGER]: ['/profiles', '/requirements', '/company', '/reports', '/admin', '/reports/invoices', '/reports/profiles', '/company/invoices'],
  [USER_ROLES.HR]: ['/profiles', '/reports', '/reports/profiles', '/leaves']
};

export const roleHelper = {
  canAccessPage: (userRole: UserRole, page: string): boolean => {
    const permissions = rolePermissions[userRole] || [];
    return permissions.some(permission => 
      page === permission || page.startsWith(permission + '/')
    );
  },

  getDefaultRoute: (userRole: UserRole): string => {
    const defaultRoutes: Record<UserRole, string> = {
      [USER_ROLES.RECRUITER]: '/profiles',
      [USER_ROLES.LEAD]: '/requirements',
      [USER_ROLES.MANAGER]: '/reports/profiles',
      [USER_ROLES.FINANCE]: '/reports/invoices',
      [USER_ROLES.HR]: '/leaves',
    };

    return defaultRoutes[userRole] || '/';
  },

  getVisibleMenuItems: (userRole: UserRole): string[] => {
    return rolePermissions[userRole] || [];
  },
};