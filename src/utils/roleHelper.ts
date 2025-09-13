import { UserRole, USER_ROLES } from '../types/roles';

const basePermissions = {
  [USER_ROLES.RECRUITER]: ['/profiles'],
  [USER_ROLES.LEAD]: ['/profiles', '/requirements'],
  [USER_ROLES.FINANCE]: ['/company/invoices']
};

const rolePermissions: Record<UserRole, string[]> = {
  ...basePermissions,
  [USER_ROLES.MANAGER]: [
    '/company', '/report', '/admin',
    ...basePermissions[USER_ROLES.RECRUITER],
    ...basePermissions[USER_ROLES.LEAD],
    ...basePermissions[USER_ROLES.FINANCE]
  ]
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
      [USER_ROLES.MANAGER]: '/admin/users',
      [USER_ROLES.FINANCE]: '/company/invoices',
    };

    return defaultRoutes[userRole] || '/';
  },

  getVisibleMenuItems: (userRole: UserRole): string[] => {
    return rolePermissions[userRole] || [];
  },
};