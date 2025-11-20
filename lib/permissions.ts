/**
 * Frontend Permission Utilities - UI ONLY
 * 
 * SECURITY WARNING: This file contains NO security logic!
 * All permission checks are purely for UI purposes.
 * Real security is enforced server-side via API middleware.
 */

// import { User } from '@/types/user';

// Temporary type until @types/user is created
type User = any;

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isGranted: boolean;
  source: 'role' | 'user_override' | 'none';
  expiresAt?: Date;
  requiresOwnership?: boolean;
  requiresAccountMatch?: boolean;
}

export interface PermissionContext {
  resource?: string;
  resourceId?: string;
  ownerId?: string;
  accountId?: string;
}

export interface PermissionUIConfig {
  hideElement?: boolean; // Hide the element completely
  disableElement?: boolean; // Disable but show element
  showPlaceholder?: boolean; // Show placeholder when hidden
  fallbackText?: string; // Text to show when permission denied
}

/**
 * Client-side permission checker
 * 
 * WARNING: This is for UI purposes ONLY!
 * Server-side validation is the ONLY security enforcement.
 */
export class ClientPermissionChecker {
  private userPermissions: Permission[] = [];
  private user: User | null = null;

  constructor(user?: User, permissions?: Permission[]) {
    if (user) {
      this.setUser(user, permissions || []);
    }
  }

  /**
   * Set current user and their permissions
   */
  setUser(user: User, permissions: Permission[]): void {
    this.user = user;
    this.userPermissions = permissions;
  }

  /**
   * Check if user has permission (UI ONLY)
   * 
   * @param permissionName - Permission to check (e.g., 'leads:read')
   * @param context - Optional context for resource-specific checks
   * @returns boolean - For UI display purposes only
   */
  hasPermission(permissionName: string, context?: PermissionContext): boolean {
    if (!this.user) {
      return false;
    }

    // Admin users can see everything (UI only)
    if (this.user.role === 'admin') {
      return true;
    }

    // Find permission in user's granted permissions
    const permission = this.userPermissions.find(p => 
      p.name === permissionName && p.isGranted
    );

    if (!permission) {
      return false;
    }

    // Check if permission has expired
    if (permission.expiresAt && new Date(permission.expiresAt) < new Date()) {
      return false;
    }

    // Resource ownership check (UI only)
    if (permission.requiresOwnership && context?.ownerId) {
      return context.ownerId === this.user.id;
    }

    // Account matching check (UI only)
    if (permission.requiresAccountMatch && context?.accountId) {
      return context.accountId === this.user.accountId;
    }

    return true;
  }

  /**
   * Check multiple permissions at once
   */
  hasAnyPermission(permissions: string[], context?: PermissionContext): boolean {
    return permissions.some(permission => this.hasPermission(permission, context));
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissions: string[], context?: PermissionContext): boolean {
    return permissions.every(permission => this.hasPermission(permission, context));
  }

  /**
   * Get user's role-based permissions for UI display
   */
  getRolePermissions(): string[] {
    if (!this.user) return [];

    // This is a simplified version for UI display
    const rolePermissions: { [key: string]: string[] } = {
      admin: ['*'],
      manager: [
        'leads:*', 'properties:*', 'users:read', 'users:update', 
        'reports:*', 'teams:*', 'settings:read'
      ],
      agent: [
        'leads:create', 'leads:read', 'leads:update', 'leads:own',
        'properties:read', 'clients:*', 'activities:*', 'tasks:*',
        'calendar:*', 'reports:own'
      ],
      viewer: [
        'leads:read', 'properties:read', 'reports:read', 'calendar:read'
      ]
    };

    return rolePermissions[this.user.role] || [];
  }

  /**
   * Check if user can perform action on resource they own
   */
  canAccessOwnResource(permission: string, resourceOwnerId?: string): boolean {
    if (!this.user || !resourceOwnerId) {
      return false;
    }

    return this.hasPermission(permission) && resourceOwnerId === this.user.id;
  }

  /**
   * Get permissions filtered by resource type
   */
  getResourcePermissions(resource: string): Permission[] {
    return this.userPermissions.filter(p => p.resource === resource && p.isGranted);
  }

  /**
   * Check if user has elevated privileges (admin or manager)
   */
  hasElevatedPrivileges(): boolean {
    return this.user?.role === 'admin' || this.user?.role === 'manager';
  }

  /**
   * Check if permission requires MFA (UI indicator only)
   */
  requiresMFA(permissionName: string): boolean {
    // Sensitive operations that typically require MFA
    const mfaRequiredPermissions = [
      'users:delete', 'users:create', 'users:impersonate',
      'accounts:delete', 'accounts:billing',
      'financial:create', 'financial:update', 'financial:delete',
      'system:admin', 'system:maintenance',
      'roles:assign', 'permissions:grant', 'permissions:revoke'
    ];

    return mfaRequiredPermissions.includes(permissionName);
  }

  /**
   * Get user's effective permissions with metadata
   */
  getEffectivePermissions(): Array<Permission & { 
    isExpired: boolean; 
    requiresMFA: boolean; 
    displayName: string; 
  }> {
    return this.userPermissions.map(permission => ({
      ...permission,
      isExpired: permission.expiresAt ? new Date(permission.expiresAt) < new Date() : false,
      requiresMFA: this.requiresMFA(permission.name),
      displayName: this.getPermissionDisplayName(permission.name)
    }));
  }

  /**
   * Get human-readable permission name
   */
  private getPermissionDisplayName(permissionName: string): string {
    const [resource, action] = permissionName.split(':');
    
    const resourceNames: { [key: string]: string } = {
      leads: 'Leads',
      properties: 'Properties',
      users: 'Users',
      accounts: 'Accounts',
      financial: 'Financial',
      reports: 'Reports',
      settings: 'Settings',
      system: 'System',
      roles: 'Roles',
      permissions: 'Permissions'
    };

    const actionNames: { [key: string]: string } = {
      create: 'Create',
      read: 'View',
      update: 'Edit',
      delete: 'Delete',
      assign: 'Assign',
      export: 'Export',
      import: 'Import',
      admin: 'Administer'
    };

    const resourceName = resourceNames[resource] || resource;
    const actionName = actionNames[action] || action;

    if (action === '*') {
      return `Full ${resourceName} Access`;
    }

    return `${actionName} ${resourceName}`;
  }
}

/**
 * Permission-based UI utilities
 */
export class UIPermissionUtils {
  /**
   * Get CSS classes based on permission
   */
  static getPermissionClasses(
    hasPermission: boolean,
    config?: PermissionUIConfig
  ): string[] {
    const classes: string[] = [];

    if (!hasPermission) {
      if (config?.hideElement) {
        classes.push('hidden');
      } else if (config?.disableElement) {
        classes.push('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
      } else {
        classes.push('permission-denied');
      }
    }

    return classes;
  }

  /**
   * Get button props based on permission
   */
  static getButtonProps(
    hasPermission: boolean,
    config?: PermissionUIConfig
  ): { disabled?: boolean; className?: string; title?: string } {
    if (!hasPermission) {
      return {
        disabled: config?.disableElement !== false,
        className: 'opacity-50 cursor-not-allowed',
        title: config?.fallbackText || 'You do not have permission to perform this action'
      };
    }

    return {};
  }

  /**
   * Format permission list for display
   */
  static formatPermissionList(permissions: Permission[]): Array<{
    category: string;
    permissions: Array<{ name: string; description: string; status: string }>;
  }> {
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as { [key: string]: Permission[] });

    return Object.entries(grouped).map(([resource, perms]) => ({
      category: resource.charAt(0).toUpperCase() + resource.slice(1),
      permissions: perms.map(p => ({
        name: p.name,
        description: p.description || `${p.action} access for ${p.resource}`,
        status: p.isGranted ? 'Granted' : 'Denied'
      }))
    }));
  }
}

/**
 * Hook-like utility for permission checking
 * (Not actually a React hook, but similar pattern)
 */
export function createPermissionContext(user?: User, permissions?: Permission[]) {
  const checker = new ClientPermissionChecker(user, permissions);

  return {
    hasPermission: checker.hasPermission.bind(checker),
    hasAnyPermission: checker.hasAnyPermission.bind(checker),
    hasAllPermissions: checker.hasAllPermissions.bind(checker),
    canAccessOwnResource: checker.canAccessOwnResource.bind(checker),
    hasElevatedPrivileges: checker.hasElevatedPrivileges.bind(checker),
    getEffectivePermissions: checker.getEffectivePermissions.bind(checker),
    requiresMFA: checker.requiresMFA.bind(checker)
  };
}

/**
 * Common permission patterns for UI
 */
export const PermissionPatterns = {
  // Lead management
  canCreateLead: (checker: ClientPermissionChecker) => 
    checker.hasPermission('leads:create'),
  
  canViewLead: (checker: ClientPermissionChecker, leadOwnerId?: string) =>
    checker.hasPermission('leads:read') || 
    checker.canAccessOwnResource('leads:own', leadOwnerId),
  
  canEditLead: (checker: ClientPermissionChecker, leadOwnerId?: string) =>
    checker.hasPermission('leads:update') ||
    checker.canAccessOwnResource('leads:own', leadOwnerId),
  
  canDeleteLead: (checker: ClientPermissionChecker) =>
    checker.hasPermission('leads:delete'),

  // Property management
  canCreateProperty: (checker: ClientPermissionChecker) =>
    checker.hasPermission('properties:create'),
  
  canViewProperty: (checker: ClientPermissionChecker) =>
    checker.hasPermission('properties:read'),
  
  canEditProperty: (checker: ClientPermissionChecker) =>
    checker.hasPermission('properties:update'),

  // User management
  canViewUsers: (checker: ClientPermissionChecker) =>
    checker.hasPermission('users:read'),
  
  canCreateUsers: (checker: ClientPermissionChecker) =>
    checker.hasPermission('users:create'),
  
  canEditUsers: (checker: ClientPermissionChecker) =>
    checker.hasPermission('users:update'),

  // Reports
  canViewReports: (checker: ClientPermissionChecker) =>
    checker.hasPermission('reports:read') || 
    checker.hasPermission('reports:own'),
  
  canCreateReports: (checker: ClientPermissionChecker) =>
    checker.hasPermission('reports:create'),

  // Settings
  canViewSettings: (checker: ClientPermissionChecker) =>
    checker.hasPermission('settings:read'),
  
  canEditSettings: (checker: ClientPermissionChecker) =>
    checker.hasPermission('settings:update'),

  // Admin functions
  isAdmin: (checker: ClientPermissionChecker) =>
    checker.hasPermission('system:admin'),
  
  canManageRoles: (checker: ClientPermissionChecker) =>
    checker.hasPermission('roles:assign'),
  
  canManagePermissions: (checker: ClientPermissionChecker) =>
    checker.hasPermission('permissions:grant')
};

// Export a default instance for convenience
export const permissionUtils = new UIPermissionUtils();