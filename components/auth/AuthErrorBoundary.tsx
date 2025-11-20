'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertTriangle, Home, LogIn } from 'lucide-react';

// ===================================
// Error Boundary State
// ===================================

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// ===================================
// Authentication Error Boundary
// ===================================

export class AuthErrorBoundary extends Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the error callback if provided
    this.props.onError?.(error, errorInfo);

    // Log the error
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoLogin = () => {
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle>Authentication Error</CardTitle>
              <CardDescription>
                Something went wrong with the authentication system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  {this.state.error?.message || 'An unknown error occurred'}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col space-y-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoLogin}
                  className="w-full"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Go to Login
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===================================
// Auth Loading States
// ===================================

export const AuthLoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}> = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};

export const AuthLoadingPage: React.FC<{
  title?: string;
  description?: string;
}> = ({ 
  title = 'Authenticating...', 
  description = 'Please wait while we verify your credentials' 
}) => (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <AuthLoadingSpinner size="lg" text="" />
      </CardContent>
    </Card>
  </div>
);

export const AuthLoadingOverlay: React.FC<{
  isVisible: boolean;
  text?: string;
}> = ({ isVisible, text = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-auto">
        <CardContent className="flex items-center space-x-4 py-6 px-8">
          <AuthLoadingSpinner size="md" text={text} />
        </CardContent>
      </Card>
    </div>
  );
};

// ===================================
// Auth Error Components
// ===================================

export const AuthError: React.FC<{
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'alert' | 'card';
}> = ({ error, onRetry, onDismiss, variant = 'alert' }) => {
  if (variant === 'card') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Authentication Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex space-x-2">
            {onRetry && (
              <Button onClick={onRetry} size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button variant="outline" onClick={onDismiss} size="sm">
                Dismiss
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription className="mt-2">
        {error}
        {(onRetry || onDismiss) && (
          <div className="flex space-x-2 mt-3">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export const NetworkErrorAlert: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => (
  <AuthError
    error="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    variant="alert"
  />
);

export const TokenExpiredAlert: React.FC<{
  onLogin?: () => void;
}> = ({ onLogin }) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Session Expired</AlertTitle>
    <AlertDescription className="mt-2">
      Your session has expired. Please log in again to continue.
      {onLogin && (
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={onLogin}>
            <LogIn className="mr-2 h-3 w-3" />
            Log In
          </Button>
        </div>
      )}
    </AlertDescription>
  </Alert>
);

export const UnauthorizedAlert: React.FC<{
  message?: string;
  onGoBack?: () => void;
}> = ({ 
  message = "You don't have permission to access this resource.",
  onGoBack 
}) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Access Denied</AlertTitle>
    <AlertDescription className="mt-2">
      {message}
      {onGoBack && (
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={onGoBack}>
            Go Back
          </Button>
        </div>
      )}
    </AlertDescription>
  </Alert>
);

// ===================================
// Auth Status Indicator
// ===================================

export const AuthStatusIndicator: React.FC<{
  isAuthenticated: boolean;
  isLoading: boolean;
  className?: string;
}> = ({ isAuthenticated, isLoading, className = '' }) => {
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
        <span className="text-xs text-muted-foreground">Checking...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${
        isAuthenticated ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className="text-xs text-muted-foreground">
        {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </span>
    </div>
  );
};

export default AuthErrorBoundary;