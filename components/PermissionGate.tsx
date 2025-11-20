/**
 * PermissionGate Component - Permission-based Rendering
 * 
 * SECURITY WARNING: This component is for UI purposes ONLY!
 * Real security is enforced server-side.
 */

import React from 'react';
import { usePermissions, usePermissionCheck, useRoleCheck } from '@/hooks/usePermissions';
import { PermissionContext, UIPermissionUtils } from '@/lib/permissions';

interface BasePermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  unauthorized?: React.ReactNode;
  className?: string;
  renderMode?: 'hide' | 'disable' | 'show-message';
  customMessage?: string;
}

interface PermissionGateProps extends BasePermissionGateProps {
  permission: string | string[];
  requireAll?: boolean;
  context?: PermissionContext;
}

interface RoleGateProps extends BasePermissionGateProps {
  roles: string | string[];
}

interface ResourceGateProps extends BasePermissionGateProps {
  permission: string;
  resourceOwnerId?: string;
  fallbackPermission?: string;
}

/**
 * Main permission gate component
 */
export function PermissionGate({
  children,
  permission,
  requireAll = false,
  context,
  fallback = null,
  loading = null,
  unauthorized = null,
  className,
  renderMode = 'hide',
  customMessage
}: PermissionGateProps) {
  const { hasPermission: checkPermission, canRender } = usePermissionCheck(
    permission,
    context,
    { requireAll }
  );

  // Show loading state
  if (loading !== null && !canRender) {
    return <>{loading}</>;
  }

  // Handle permission denied
  if (!checkPermission) {
    if (renderMode === 'hide') {
      return <>{fallback}</>;
    }

    if (renderMode === 'show-message') {
      return (
        <div className={`permission-denied-message ${className || ''}`}>
          {unauthorized || customMessage || 'You do not have permission to view this content.'}
        </div>
      );
    }

    if (renderMode === 'disable') {
      return (
        <div className={`permission-disabled ${className || ''}`} 
             style={{ opacity: 0.5, pointerEvents: 'none' }}>
          {children}
        </div>
      );
    }
  }

  // Render children if permission granted
  return <div className={className}>{children}</div>;
}

/**
 * Role-based gate component
 */
export function RoleGate({
  children,
  roles,
  fallback = null,
  unauthorized = null,
  className,
  renderMode = 'hide',
  customMessage
}: RoleGateProps) {
  const { hasRole } = useRoleCheck(roles);

  if (!hasRole) {
    if (renderMode === 'hide') {
      return <>{fallback}</>;
    }

    if (renderMode === 'show-message') {
      return (
        <div className={`role-denied-message ${className || ''}`}>
          {unauthorized || customMessage || 'Your role does not have access to this content.'}
        </div>
      );
    }

    if (renderMode === 'disable') {
      return (
        <div className={`role-disabled ${className || ''}`} 
             style={{ opacity: 0.5, pointerEvents: 'none' }}>
          {children}
        </div>
      );
    }
  }

  return <div className={className}>{children}</div>;
}

/**
 * Resource ownership gate component
 */
export function ResourceGate({
  children,
  permission,
  resourceOwnerId,
  fallbackPermission,
  fallback = null,
  unauthorized = null,
  className,
  renderMode = 'hide',
  customMessage
}: ResourceGateProps) {
  const { canAccessOwnResource, hasPermission } = usePermissions();

  const hasAccess = React.useMemo(() => {
    // Check resource ownership
    if (resourceOwnerId && canAccessOwnResource(permission, resourceOwnerId)) {
      return true;
    }

    // Check fallback permission
    if (fallbackPermission && hasPermission(fallbackPermission)) {
      return true;
    }

    // Check general permission
    return hasPermission(permission);
  }, [permission, resourceOwnerId, fallbackPermission, canAccessOwnResource, hasPermission]);

  if (!hasAccess) {
    if (renderMode === 'hide') {
      return <>{fallback}</>;
    }

    if (renderMode === 'show-message') {
      return (
        <div className={`resource-denied-message ${className || ''}`}>
          {unauthorized || customMessage || 'You do not have access to this resource.'}
        </div>
      );
    }

    if (renderMode === 'disable') {
      return (
        <div className={`resource-disabled ${className || ''}`} 
             style={{ opacity: 0.5, pointerEvents: 'none' }}>
          {children}
        </div>
      );
    }
  }

  return <div className={className}>{children}</div>;
}

/**
 * Admin-only gate component
 */
export function AdminGate({
  children,
  fallback = null,
  unauthorized = null,
  className,
  renderMode = 'hide',
  customMessage
}: BasePermissionGateProps) {
  return (
    <PermissionGate
      permission="system:admin"
      fallback={fallback}
      unauthorized={unauthorized}
      className={className}
      renderMode={renderMode}
      customMessage={customMessage || 'Administrator access required.'}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * Elevated privileges gate (admin or manager)
 */
export function ElevatedGate({
  children,
  fallback = null,
  unauthorized = null,
  className,
  renderMode = 'hide',
  customMessage
}: BasePermissionGateProps) {
  return (
    <RoleGate
      roles={['admin', 'manager']}
      fallback={fallback}
      unauthorized={unauthorized}
      className={className}
      renderMode={renderMode}
      customMessage={customMessage || 'Manager or Administrator access required.'}
    >
      {children}
    </RoleGate>
  );
}

/**
 * Conditional button with permission-based styling
 */
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission: string;
  context?: PermissionContext;
  unauthorizedText?: string;
  showUnauthorized?: boolean;
}

export function PermissionButton({
  children,
  permission,
  context,
  unauthorizedText = 'Unauthorized',
  showUnauthorized = true,
  className,
  ...props
}: PermissionButtonProps) {
  const { hasPermission } = usePermissions();
  const hasRequiredPermission = hasPermission(permission, context);

  const buttonProps = UIPermissionUtils.getButtonProps(
    hasRequiredPermission,
    { 
      disableElement: true, 
      fallbackText: unauthorizedText 
    }
  );

  return (
    <button
      {...props}
      {...buttonProps}
      className={`${className || ''} ${buttonProps.className || ''}`.trim()}
    >
      {hasRequiredPermission || !showUnauthorized 
        ? children 
        : unauthorizedText
      }
    </button>
  );
}

/**
 * Conditional link with permission-based styling
 */
interface PermissionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  permission: string;
  context?: PermissionContext;
  unauthorizedText?: string;
  preventNavigation?: boolean;
}

export function PermissionLink({
  children,
  permission,
  context,
  unauthorizedText = 'Unauthorized',
  preventNavigation = true,
  className,
  onClick,
  ...props
}: PermissionLinkProps) {
  const { hasPermission } = usePermissions();
  const hasRequiredPermission = hasPermission(permission, context);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasRequiredPermission && preventNavigation) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <a
      {...props}
      onClick={handleClick}
      className={`${className || ''} ${
        hasRequiredPermission ? '' : 'opacity-50 cursor-not-allowed'
      }`.trim()}
    >
      {hasRequiredPermission ? children : unauthorizedText}
    </a>
  );
}

/**
 * Permission status indicator
 */
interface PermissionStatusProps {
  permission: string;
  context?: PermissionContext;
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function PermissionStatus({
  permission,
  context,
  showIcon = true,
  showText = true,
  className
}: PermissionStatusProps) {
  const { hasPermission, requiresMFA } = usePermissions();
  const hasRequiredPermission = hasPermission(permission, context);
  const needsMFA = requiresMFA(permission);

  return (
    <div className={`permission-status ${className || ''}`}>
      {showIcon && (
        <span className={`permission-icon ${hasRequiredPermission ? 'granted' : 'denied'}`}>
          {hasRequiredPermission ? '✅' : '❌'}
        </span>
      )}
      {showText && (
        <span className="permission-text">
          {hasRequiredPermission 
            ? `Permission granted${needsMFA ? ' (MFA required)' : ''}` 
            : 'Permission denied'
          }
        </span>
      )}
      {needsMFA && (
        <span className="mfa-indicator" title="Multi-factor authentication required">
          🔐
        </span>
      )}
    </div>
  );
}

/**
 * Permission debugging component (development only)
 */
export function PermissionDebugger({ 
  permission, 
  context 
}: { 
  permission: string; 
  context?: PermissionContext; 
}) {
  const { 
    hasPermission, 
    permissions, 
    getEffectivePermissions,
    hasElevatedPrivileges 
  } = usePermissions();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const hasRequiredPermission = hasPermission(permission, context);
  const effectivePermissions = getEffectivePermissions();

  return (
    <details className="permission-debugger border p-4 rounded bg-gray-100 text-sm">
      <summary className="cursor-pointer font-semibold">
        Permission Debug: {permission} - {hasRequiredPermission ? '✅ GRANTED' : '❌ DENIED'}
      </summary>
      <div className="mt-2 space-y-2">
        <div>
          <strong>Checking:</strong> {permission}
        </div>
        <div>
          <strong>Context:</strong> {JSON.stringify(context, null, 2)}
        </div>
        <div>
          <strong>Result:</strong> {hasRequiredPermission ? 'GRANTED' : 'DENIED'}
        </div>
        <div>
          <strong>Elevated Privileges:</strong> {hasElevatedPrivileges() ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Total Permissions:</strong> {permissions.length}
        </div>
        <details>
          <summary className="cursor-pointer">View All Permissions</summary>
          <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(effectivePermissions, null, 2)}
          </pre>
        </details>
      </div>
    </details>
  );
}

// Re-export hooks for convenience
export { 
  usePermissions, 
  usePermissionCheck, 
  useRoleCheck 
} from '@/hooks/usePermissions';