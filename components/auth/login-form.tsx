/**
 * Premium Login Form Component
 * 
 * Beautiful, responsive login form with smooth animations, micro-interactions,
 * form validation, loading states, and exceptional UX design.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Shield,
  Building2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

// Tipos locais para substituir os imports do Azure
interface LoginFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
}

interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Login form validation schema
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  rememberMe: z.boolean().optional(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

/**
 * Animation variants
 */
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const errorVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

/**
 * Loading skeleton component
 */
function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse mt-6" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Success animation component
 */
function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
        className="bg-white rounded-full p-6 shadow-2xl"
      >
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </motion.div>
    </motion.div>
  );
}

/**
 * Main Login Form Component
 */
export function LoginForm({
  onSuccess,
  onError,
  className = '',
  showRememberMe = true,
  showForgotPassword = true,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading: authLoading, error: authError, clearError } = useAuth();
  
  // Local state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    clearErrors,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  /**
   * Handle form submission
   */
  const onSubmit = async (data: LoginFormInputs) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      clearError();
      clearErrors();

      const result = await login(data.email, data.password);

      // Handle success
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.(result);
        const returnUrl = searchParams.get('returnUrl') || '/dashboard';
        router.push(returnUrl);
      }, 1500);

      if (result.success) {
        toast.success(`Welcome back!`);
      }
    } catch (error: any) {
      console.error('Login submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Input field component with animations
   */
  const AnimatedInput = ({ 
    icon: Icon, 
    type, 
    placeholder, 
    field, 
    error,
    ...props 
  }: any) => {
    const isFocused = focusedField === field;
    const hasValue = field === 'email' ? watchedEmail : watchedPassword;
    const hasError = !!error;

    return (
      <motion.div
        variants={itemVariants}
        className="relative group"
      >
        <Label 
          htmlFor={field}
          className={`text-sm font-medium transition-colors duration-200 ${
            hasError ? 'text-red-600' : 'text-gray-700'
          }`}
        >
          {field === 'email' ? 'Email Address' : 'Password'}
        </Label>
        <div className="relative mt-1">
          <motion.div
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
              isFocused || hasValue ? 'text-blue-500' : 'text-gray-400'
            } ${hasError ? 'text-red-500' : ''}`}
            animate={{ 
              scale: isFocused ? 1.1 : 1,
              x: isFocused ? 2 : 0
            }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
          
          <Input
            id={field}
            type={type}
            placeholder={placeholder}
            className={`pl-12 pr-4 h-12 border-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : isFocused
                ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20 shadow-lg'
                : hasValue
                ? 'border-green-300 focus:border-blue-500'
                : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
            }`}
            onFocus={() => setFocusedField(field)}
            {...register(field, {
              onBlur: () => setFocusedField(null)
            })}
            {...props}
          />

          {/* Password visibility toggle */}
          {field === 'password' && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </motion.button>
          )}
        </div>

        {/* Field validation indicator */}
        <AnimatePresence>
          {hasValue && !hasError && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute right-3 top-9 text-green-500"
            >
              <CheckCircle2 className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              variants={errorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-sm text-red-600 mt-1 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {error.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Show loading skeleton on initial load
  if (authLoading && !isDirty) {
    return <LoginSkeleton />;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`w-full max-w-md ${className}`}
        >
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 mb-4"
              >
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome Back</h1>
                  <p className="text-blue-100 text-sm">Sign in to your account</p>
                </div>
              </motion.div>
              
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <Building2 className="h-full w-full" />
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Global error message */}
              <AnimatePresence>
                {authError && (
                  <motion.div
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {authError}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email field */}
                <AnimatedInput
                  icon={Mail}
                  type="email"
                  field="email"
                  placeholder="Enter your email"
                  error={errors.email}
                  autoComplete="email"
                  disabled={isSubmitting}
                />

                {/* Password field */}
                <AnimatedInput
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  field="password"
                  placeholder="Enter your password"
                  error={errors.password}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />

                {/* Remember me and forgot password */}
                {(showRememberMe || showForgotPassword) && (
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-between"
                  >
                    {showRememberMe && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          {...register('rememberMe')}
                          disabled={isSubmitting}
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          Remember me
                        </Label>
                      </div>
                    )}

                    {showForgotPassword && (
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto"
                        onClick={() => router.push('/auth/forgot-password')}
                        disabled={isSubmitting}
                      >
                        Forgot password?
                      </Button>
                    )}
                  </motion.div>
                )}

                {/* Submit button */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base shadow-lg transition-all duration-200"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </motion.div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Footer message */}
              <motion.div
                variants={itemVariants}
                className="text-center text-sm text-gray-600"
              >
                Don&apos;t have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                  onClick={() => router.push('/auth/register')}
                  disabled={isSubmitting}
                >
                  Contact your administrator
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Success animation overlay */}
      <AnimatePresence>
        {showSuccess && <SuccessAnimation />}
      </AnimatePresence>
    </>
  );
}

export default LoginForm;