/**
 * Loading & Error States Components
 * 
 * Beautiful loading animations, skeleton loaders, error states,
 * and empty state components with smooth animations.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Frown,
  Search,
  FileX,
  Users,
  Building2,
  Database,
  Zap,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Loading spinner with text
 */
export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
      )}
    </motion.div>
  );
}

/**
 * Full page loading component
 */
export function PageLoading({ 
  title = 'Loading...', 
  subtitle = 'Please wait while we fetch your data' 
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-6"
        >
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-semibold text-gray-900 dark:text-white mb-2"
        >
          {title}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-600 dark:text-gray-400"
        >
          {subtitle}
        </motion.p>
      </motion.div>
    </div>
  );
}

/**
 * Skeleton loader for cards
 */
export function CardSkeleton({ 
  lines = 3, 
  showHeader = true 
}: {
  lines?: number;
  showHeader?: boolean;
}) {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        {showHeader && (
          <div className="mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <div 
              key={index}
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
              style={{ width: `${Math.random() * 40 + 60}%` }}
            ></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({ 
  rows = 5, 
  columns = 4 
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                style={{ width: `${Math.random() * 30 + 70}%` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Progressive loading indicator
 */
export function ProgressiveLoader({ 
  steps, 
  currentStep = 0 
}: {
  steps: string[];
  currentStep?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isCompleted 
                ? 'bg-green-500' 
                : isCurrent 
                ? 'bg-blue-500' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              )}
            </div>
            <span className={`text-sm ${
              isCompleted 
                ? 'text-green-600 dark:text-green-400' 
                : isCurrent 
                ? 'text-blue-600 dark:text-blue-400 font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {step}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/**
 * Error boundary component
 */
export function ErrorState({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  showRefresh = true,
  className = ''
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRefresh?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4"
      >
        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </motion.div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {message}
      </p>
      
      {showRefresh && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </motion.div>
  );
}

/**
 * Network error component
 */
export function NetworkError({ 
  onRetry 
}: {
  onRetry?: () => void;
}) {
  return (
    <ErrorState
      title="Connection Problem"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}

/**
 * Empty state component
 */
export function EmptyState({ 
  icon: Icon = FileX,
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  action,
  className = ''
}: {
  icon?: React.ComponentType<any>;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
      >
        <Icon className="w-8 h-8 text-gray-400" />
      </motion.div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {description}
      </p>
      
      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Specialized empty states
 */
export const EmptyStates = {
  NoLeads: () => (
    <EmptyState
      icon={Users}
      title="No leads found"
      description="Start generating leads by creating campaigns or importing contacts."
      action={
        <div className="flex gap-2">
          <Button>Import Leads</Button>
          <Button variant="outline">Create Campaign</Button>
        </div>
      }
    />
  ),
  
  NoProperties: () => (
    <EmptyState
      icon={Building2}
      title="No properties listed"
      description="Add your first property to start showcasing your real estate portfolio."
      action={<Button>Add Property</Button>}
    />
  ),
  
  NoSearchResults: ({ query }: { query: string }) => (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search terms.`}
    />
  ),
  
  DatabaseError: ({ onRetry }: { onRetry?: () => void }) => (
    <EmptyState
      icon={Database}
      title="Database Connection Error"
      description="Unable to connect to the database. Please try again in a moment."
      action={
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      }
    />
  ),
};

/**
 * Offline indicator
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white p-2 text-center text-sm font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            You&apos;re currently offline. Some features may not be available.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Loading overlay for forms and modals
 */
export function LoadingOverlay({ 
  isVisible, 
  message = 'Processing...' 
}: {
  isVisible: boolean;
  message?: string;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-2xl flex flex-col items-center gap-4 min-w-48"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const LoadingStates = {
  LoadingSpinner,
  PageLoading,
  CardSkeleton,
  TableSkeleton,
  ProgressiveLoader,
  ErrorState,
  NetworkError,
  EmptyState,
  EmptyStates,
  OfflineIndicator,
  LoadingOverlay,
};

export default LoadingStates;