/**
 * usePermissions Hook - Frontend Permission Management
 * 
 * SECURITY WARNING: This hook is for UI purposes ONLY!
 * Real permission validation happens server-side.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { ClientPermissionChecker, Permission, PermissionContext } from '@/lib/permissions';
// import { User } from '@/types/user';

// Temporary type until @types/user is created
type User = any;

// Helper function to get user from auth
function useUser() {
  const { user } = useAuth();
  return user;
}

interface UsePermissionsOptions {
  loadPermissionsOnMount?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface PermissionState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook for managing user permissions in React components
 */
export function usePermissions(options: UsePermissionsOptions = {}) {
  const { loadPermissionsOnMount = true, refreshInterval } = options;
  // const user = useUser() as User | null;
  const user = null; // Temporary until auth is fixed

  const [state, setState] = useState<PermissionState>({
    permissions: [],
    loading: false,
    error: null,
    lastUpdated: null
  });

  // Create permission checker instance
  const permissionChecker = useMemo(() => {
    return new ClientPermissionChecker(user || undefined, state.permissions);
  }, [user, state.permissions]);

  /**
   * Load permissions from API
   */
  const loadPermissions = useCallback(async (userId?: string) => {
    if (!user && !userId) return;

    const targetUserId = userId || (user && 'id' in user ? (user as any).id : undefined);
    if (!targetUserId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get access token if available
      const accessToken = user && 'access_token' in user ? (user as any).access_token : undefined;

      // Call API to get user permissions
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/permissions/users/${targetUserId}`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to load permissions: ${response.status}`);
      }

      const data = await response.json();
      const permissions = data.data?.permissions || [];

      setState({
        permissions,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

      // Update permission checker
      permissionChecker.setUser(user!, permissions);

    } catch (error) {
      console.error('Failed to load permissions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load permissions'
      }));
    }
  }, [user, permissionChecker]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((
    permissionName: string,
    context?: PermissionContext
  ): boolean => {
    return permissionChecker.hasPermission(permissionName, context);
  }, [permissionChecker]);

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback((
    permissions: string[],
    context?: PermissionContext
  ): boolean => {
    return permissionChecker.hasAnyPermission(permissions, context);
  }, [permissionChecker]);

  /**
   * Check if user has all specified permissions
   */
  const hasAllPermissions = useCallback((
    permissions: string[],
    context?: PermissionContext
  ): boolean => {
    return permissionChecker.hasAllPermissions(permissions, context);
  }, [permissionChecker]);

  /**
   * Check if user can access their own resource
   */
  const canAccessOwnResource = useCallback((
    permission: string,
    resourceOwnerId?: string
  ): boolean => {
    return permissionChecker.canAccessOwnResource(permission, resourceOwnerId);
  }, [permissionChecker]);

  /**
   * Check if user has elevated privileges
   */
  const hasElevatedPrivileges = useCallback((): boolean => {
    return permissionChecker.hasElevatedPrivileges();
  }, [permissionChecker]);

  /**
   * Get effective permissions with metadata
   */
  const getEffectivePermissions = useCallback(() => {
    return permissionChecker.getEffectivePermissions();
  }, [permissionChecker]);

  /**
   * Check if permission requires MFA
   */
  const requiresMFA = useCallback((permissionName: string): boolean => {
    return permissionChecker.requiresMFA(permissionName);
  }, [permissionChecker]);

  /**
   * Refresh permissions
   */
  const refresh = useCallback(() => {
    return loadPermissions();
  }, [loadPermissions]);

  // Load permissions on mount
  useEffect(() => {
    if (loadPermissionsOnMount && user) {
      loadPermissions();
    }
  }, [loadPermissionsOnMount, user, loadPermissions]);

  // Set up refresh interval
  useEffect(() => {
    if (!refreshInterval || refreshInterval < 1000) return;

    const interval = setInterval(() => {
      if (user) {
        loadPermissions();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, user, loadPermissions]);

  return {
    // State
    permissions: state.permissions,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessOwnResource,
    hasElevatedPrivileges,
    requiresMFA,

    // Data access
    getEffectivePermissions,
    getResourcePermissions: (resource: string) => 
      state.permissions.filter(p => p.resource === resource && p.isGranted),

    // Actions
    refresh,
    loadPermissions
  };
}

/**
 * Hook for checking specific permissions with loading states
 */
export function usePermissionCheck(
  permission: string | string[],
  context?: PermissionContext,
  options?: { requireAll?: boolean }
) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  const hasRequiredPermission = useMemo(() => {
    if (loading) return false;

    if (Array.isArray(permission)) {
      return options?.requireAll 
        ? hasAllPermissions(permission, context)
        : hasAnyPermission(permission, context);
    }

    return hasPermission(permission, context);
  }, [permission, context, options?.requireAll, hasPermission, hasAnyPermission, hasAllPermissions, loading]);

  return {
    hasPermission: hasRequiredPermission,
    loading,
    canRender: !loading && hasRequiredPermission
  };
}

/**
 * Hook for role-based access control
 */
export function useRoleCheck(allowedRoles: string | string[]) {
  const user = useUser() as User | null;

  const hasRole = useMemo(() => {
    if (!user?.role) return false;

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(user.role);
  }, [user?.role, allowedRoles]);

  return {
    hasRole,
    userRole: user?.role || null,
    canRender: hasRole
  };
}

/**
 * Hook for resource ownership checks
 */
export function useResourceAccess(
  permission: string,
  resourceOwnerId?: string,
  fallbackPermission?: string
) {
  const { canAccessOwnResource, hasPermission } = usePermissions();

  const hasAccess = useMemo(() => {
    // Check if user can access their own resource
    if (resourceOwnerId && canAccessOwnResource(permission, resourceOwnerId)) {
      return true;
    }

    // Check fallback permission (e.g., admin access)
    if (fallbackPermission && hasPermission(fallbackPermission)) {
      return true;
    }

    // Check general permission
    return hasPermission(permission);
  }, [permission, resourceOwnerId, fallbackPermission, canAccessOwnResource, hasPermission]);

  return {
    hasAccess,
    canRender: hasAccess
  };
}

/**
 * Hook for conditional rendering based on permissions
 */
export function useConditionalRender(
  condition: () => boolean,
  dependencies: React.DependencyList = []
) {
  const shouldRender = useMemo(() => {
    try {
      return condition();
    } catch (error) {
      console.error('Error in conditional render:', error);
      return false;
    }
  }, dependencies);

  return {
    shouldRender,
    canRender: shouldRender
  };
}

/**
 * Hook for admin-only access
 */
export function useAdminAccess() {
  const { hasPermission, hasElevatedPrivileges } = usePermissions();

  return {
    isAdmin: hasPermission('system:admin'),
    hasElevatedPrivileges: hasElevatedPrivileges(),
    canManageRoles: hasPermission('roles:assign'),
    canManagePermissions: hasPermission('permissions:grant'),
    canAccessSystemSettings: hasPermission('system:settings')
  };
}

/**
 * Hook for MFA-required operations
 */
export function useMFAStatus() {
  const [mfaToken, setMFAToken] = useState<string | null>(null);
  const [mfaExpiry, setMFAExpiry] = useState<Date | null>(null);
  const { requiresMFA } = usePermissions();

  const hasMFAToken = useMemo(() => {
    return mfaToken !== null && (mfaExpiry === null || mfaExpiry > new Date());
  }, [mfaToken, mfaExpiry]);

  const canPerformAction = useCallback((permission: string): boolean => {
    if (!requiresMFA(permission)) {
      return true;
    }
    return hasMFAToken;
  }, [requiresMFA, hasMFAToken]);

  const setMFA = useCallback((token: string, expiryMinutes: number = 30) => {
    setMFAToken(token);
    setMFAExpiry(new Date(Date.now() + expiryMinutes * 60 * 1000));
  }, []);

  const clearMFA = useCallback(() => {
    setMFAToken(null);
    setMFAExpiry(null);
  }, []);

  return {
    hasMFAToken,
    canPerformAction,
    setMFA,
    clearMFA,
    mfaExpiry
  };
}