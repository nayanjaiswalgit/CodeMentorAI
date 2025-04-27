// Define all roles
export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  GUEST = 'guest',
}

// Define all permissions in one place
export enum Permission {
  VIEW_DASHBOARD = 'view_dashboard',
  EDIT_PROFILE = 'edit_profile',
  MANAGE_USERS = 'manage_users',
  MANAGE_COURSES = 'manage_courses',
  VIEW_COURSES = 'view_courses',
  SUBMIT_CHALLENGE = 'submit_challenge',
  VIEW_REPORTS = 'view_reports',
  ACCESS_ADMIN_PANEL = 'access_admin_panel',
}

// Map roles to permissions
export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.EDIT_PROFILE,
    Permission.MANAGE_USERS,
    Permission.MANAGE_COURSES,
    Permission.VIEW_COURSES,
    Permission.SUBMIT_CHALLENGE,
    Permission.VIEW_REPORTS,
    Permission.ACCESS_ADMIN_PANEL,
  ],
  [UserRole.INSTRUCTOR]: [
    Permission.VIEW_DASHBOARD,
    Permission.EDIT_PROFILE,
    Permission.MANAGE_COURSES,
    Permission.VIEW_COURSES,
    Permission.SUBMIT_CHALLENGE,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.STUDENT]: [
    Permission.VIEW_DASHBOARD,
    Permission.EDIT_PROFILE,
    Permission.VIEW_COURSES,
    Permission.SUBMIT_CHALLENGE,
  ],
  [UserRole.GUEST]: [
    Permission.VIEW_COURSES,
  ],
};

// Utility to check if a user has a permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return RolePermissions[role]?.includes(permission) ?? false;
}
