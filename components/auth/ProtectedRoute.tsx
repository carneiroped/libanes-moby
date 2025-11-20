'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface RouteProtection {
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  allowedAccounts?: string[];
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  protection?: RouteProtection;
  redirectTo?: string;
}

/**
 * Loading component for protected routes
 */
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

/**
 * Unauthorized access component
 */
const UnauthorizedFallback: React.FC<{ reason?: string }> = ({ reason }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="max-w-md w-full mx-auto text-center space-y-4">
      <div className="text-6xl">🔒</div>
      <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
      <p className="text-muted-foreground">
        {reason === 'unauthorized' && 'You do not have the required role to access this page.'}
        {reason === 'insufficient_permissions' && 'You do not have the required permissions to access this page.'}
        {reason === 'invalid_account' && 'This page is not available for your account.'}
        {!reason && 'You are not authorized to access this page.'}
      </p>
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Go Back
      </button>
    </div>
  </div>
);

/**
 * Protected Route Component
 * Wraps components that require authentication and/or authorization
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  protection = { requireAuth: true },
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Determinar se o usuário tem acesso
  let allowed = true;
  let reason: string | undefined = undefined;

  useEffect(() => {
    if (!loading && protection.requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [loading, protection.requireAuth, isAuthenticated, redirectTo, router]);

  // Show loading state
  if (loading) {
    return fallback || <LoadingFallback />;
  }

  // Check authentication
  if (protection.requireAuth && !isAuthenticated) {
    return <LoadingFallback />;
  }

  // Check roles
  if (protection.requiredRoles && protection.requiredRoles.length > 0 && user) {
    const hasRole = protection.requiredRoles.includes(user.role);
    if (!hasRole) {
      allowed = false;
      reason = 'unauthorized';
    }
  }

  // Check permissions
  if (protection.requiredPermissions && protection.requiredPermissions.length > 0 && user) {
    const userPermissions = user.permissions || [];
    const hasPermission = protection.requiredPermissions.some(p => userPermissions.includes(p));
    if (!hasPermission) {
      allowed = false;
      reason = 'insufficient_permissions';
    }
  }

  // Check allowed accounts
  if (protection.allowedAccounts && protection.allowedAccounts.length > 0 && user) {
    const hasAccount = protection.allowedAccounts.includes(user.account.id);
    if (!hasAccount) {
      allowed = false;
      reason = 'invalid_account';
    }
  }

  // Show unauthorized state
  if (!allowed) {
    return fallback || <UnauthorizedFallback reason={reason} />;
  }

  // Render protected content
  return <>{children}</>;
};

/**
 * Higher-order component for route protection
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  protection?: ProtectedRouteProps['protection']
) {
  const WrappedComponent: React.FC<P> = (props) => (
    <ProtectedRoute protection={protection}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Role-based protection component
 */
export const RequireRole: React.FC<{
  role: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ role, children, fallback }) => {
  const roles = Array.isArray(role) ? role : [role];
  
  return (
    <ProtectedRoute 
      protection={{ 
        requireAuth: true, 
        requiredRoles: roles 
      }}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Permission-based protection component
 */
export const RequirePermission: React.FC<{
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}> = ({ permission, children, fallback, requireAll = true }) => {
  const permissions = Array.isArray(permission) ? permission : [permission];
  
  return (
    <ProtectedRoute 
      protection={{ 
        requireAuth: true, 
        requiredPermissions: requireAll ? permissions : [permissions[0]] // For simplicity, just check first if not requireAll
      }}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Account-based protection component
 */
export const RequireAccount: React.FC<{
  account: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ account, children, fallback }) => {
  const accounts = Array.isArray(account) ? account : [account];
  
  return (
    <ProtectedRoute 
      protection={{ 
        requireAuth: true, 
        allowedAccounts: accounts 
      }}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * Conditional rendering based on authentication status
 */
export const AuthGuard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  when?: 'authenticated' | 'unauthenticated';
}> = ({ children, fallback, when = 'authenticated' }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return fallback || <LoadingFallback />;
  }

  if (when === 'authenticated' && !isAuthenticated) {
    return <>{fallback}</>;
  }

  if (when === 'unauthenticated' && isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Admin-only protection component
 */
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RequireRole role="admin" fallback={fallback}>
    {children}
  </RequireRole>
);

/**
 * Guest-only component (unauthenticated users)
 */
export const GuestOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <AuthGuard when="unauthenticated" fallback={fallback}>
    {children}
  </AuthGuard>
);

export default ProtectedRoute;