/**
 * Protected Route Component
 * 
 * Route protection component with role-based access control,
 * loading states, and beautiful fallback components.
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// import { ProtectedRouteProps } from '@/lib/azure/types'; // REMOVIDO: Azure Auth não é mais usado
import { useAuth } from '@/providers/auth-provider';
import { Loader2, Shield, AlertTriangle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Tipo local para substituir import Azure
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Loading component with beautiful animation
 */
function AuthLoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-4"
        >
          <Loader2 className="h-12 w-12 text-blue-600" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-semibold text-gray-900 mb-2"
        >
          Verifying Authentication
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-600"
        >
          Please wait while we check your credentials...
        </motion.p>
      </motion.div>
    </div>
  );
}

/**
 * Unauthorized access component
 */
function UnauthorizedComponent({ 
  message, 
  onRetry, 
  showRetry = true 
}: { 
  message: string; 
  onRetry?: () => void; 
  showRetry?: boolean; 
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <Card className="border-red-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
            >
              <Lock className="h-8 w-8 text-red-600" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col gap-2 pt-2">
              {showRetry && onRetry && (
                <Button 
                  onClick={onRetry}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Retry Authorization
                </Button>
              )}
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/login')}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Authentication error component
 */
function AuthErrorComponent({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry: () => void; 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-red-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="border-yellow-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4"
            >
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </motion.div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-gray-600">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={onRetry}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Main Protected Route Component
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermissions = [],
  fallback,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth(); // Usar useAuth do providers/auth-provider
  const router = useRouter();
  const pathname = usePathname();
  const error = null; // Não há mais error do Azure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  const clearError = () => {}; // Função vazia para compatibilidade

  /**
   * Handle redirect to login with return URL
   */
  const redirectToLogin = React.useCallback(() => {
    const returnUrl = encodeURIComponent(pathname);
    router.push(`${redirectTo}?returnUrl=${returnUrl}`);
  }, [pathname, redirectTo, router]);

  /**
   * Retry authentication
   */
  const retryAuth = React.useCallback(async () => {
    clearError();
    try {
      // Refresh page para revalidar sessão
      window.location.reload();
    } catch (err) {
      console.error('Auth retry failed:', err);
    }
  }, [clearError]);

  /**
   * Handle authentication redirect
   */
  useEffect(() => {
    if (!loading && !isAuthenticated && !error) {
      redirectToLogin();
    }
  }, [loading, isAuthenticated, error, redirectToLogin]);

  /**
   * Loading state
   */
  if (loading) {
    return fallback || <AuthLoadingComponent />;
  }

  /**
   * Authentication error state
   */
  if (error) {
    return <AuthErrorComponent error={error} onRetry={retryAuth} />;
  }

  /**
   * Not authenticated state
   */
  if (!isAuthenticated || !user) {
    redirectToLogin();
    return <AuthLoadingComponent />;
  }

  /**
   * Role-based access control
   */
  if (requiredRole && user.role !== requiredRole) {
    return (
      <UnauthorizedComponent
        message={`This page requires ${requiredRole} role. You have ${user.role} role.`}
        onRetry={retryAuth}
      />
    );
  }

  /**
   * Permission-based access control
   */
  if (requiredPermissions.length > 0) {
    const userPermissions = user.permissions || [];
    const hasPermission = requiredPermissions.some(p => userPermissions.includes(p));

    if (!hasPermission) {
      const permissionList = requiredPermissions.join(', ');
      return (
        <UnauthorizedComponent
          message={`This page requires one of the following permissions: ${permissionList}`}
          onRetry={retryAuth}
        />
      );
    }
  }

  /**
   * Account status check (opcional - pode não existir a propriedade)
   */
  if (user.account && 'isActive' in user.account && !(user.account as any).isActive) {
    return (
      <UnauthorizedComponent
        message="Your account is inactive. Please contact support to reactivate your account."
        showRetry={false}
      />
    );
  }

  /**
   * Render protected content
   */
  return <>{children}</>;
}

/**
 * Higher-order component for route protection
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: string;
    requiredPermissions?: string[];
    redirectTo?: string;
  }
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <ProtectedRoute
        requiredRole={options?.requiredRole}
        requiredPermissions={options?.requiredPermissions}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
}

/**
 * Route protection for admin users
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}

/**
 * Route protection for manager users
 */
export function ManagerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredPermissions={['manage_users', 'manage_properties']}>
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;