'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';

// Tipos locais
interface LoginFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  redirectTo?: string;
  className?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// ===================================
// Validation Schema
// ===================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  remember_me: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ===================================
// Login Form Component
// ===================================

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo = '/dashboard',
  className = '',
}) => {
  const router = useRouter();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
  });

  // Clear errors when form changes
  const watchedFields = watch();
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watchedFields, error, clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      await login(loginData.email, loginData.password);
      
      // Call success callback if provided
      onSuccess?.({ 
        id: '', 
        email: data.email, 
        name: '', 
        role: '', 
        account: { id: '', name: '', slug: '', plan: '' } 
      });
      
      // Redirect on success
      router.push(redirectTo);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      onError?.(errorMessage);
    }
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Sign in to your account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@remax.com.br"
              autoComplete="email"
              autoFocus
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register('password')}
                className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember_me"
              {...register('remember_me')}
            />
            <Label
              htmlFor="remember_me"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me for 30 days
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || isSubmitting}
          >
            {(loading || isSubmitting) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => {
                // TODO: Implement forgot password functionality
                console.log('Forgot password clicked');
              }}
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// ===================================
// Simple Login Form (without card wrapper)
// ===================================

export const SimpleLoginForm: React.FC<LoginFormProps> = (props) => {
  return (
    <div className={`w-full max-w-md mx-auto ${props.className || ''}`}>
      <LoginForm {...props} className="" />
    </div>
  );
};

// ===================================
// Inline Login Form (compact version)
// ===================================

export const InlineLoginForm: React.FC<LoginFormProps & { 
  title?: string;
  showRememberMe?: boolean;
}> = ({
  onSuccess,
  onError,
  redirectTo = '/dashboard',
  className = '',
  title = 'Sign In',
  showRememberMe = true,
}) => {
  const { login, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Clear errors when form changes
  const watchedFields = watch();
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watchedFields, error, clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      onSuccess?.({
        id: '',
        email: data.email,
        name: '',
        role: '',
        account: { id: '', name: '', slug: '', plan: '' }
      });
    } catch (err: any) {
      onError?.(err.message);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-center">{title}</h2>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <Input
            type="email"
            placeholder="Email"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            {...register('password')}
            className={`pr-8 ${errors.password ? 'border-destructive' : ''}`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-2 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Eye className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        {showRememberMe && (
          <div className="flex items-center space-x-2">
            <Checkbox id="remember_inline" {...register('remember_me')} />
            <Label htmlFor="remember_inline" className="text-xs">
              Remember me
            </Label>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="sm"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;