'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

export interface ProgressOverlayProps {
  isOpen: boolean;
  title: string;
  description?: string;
  progress?: number;
  total?: number;
  showPercentage?: boolean;
  showProgressBar?: boolean;
  status?: 'loading' | 'success' | 'error' | 'warning';
  steps?: ProgressStep[];
  currentStep?: number;
  onCancel?: () => void;
  onClose?: () => void;
  cancelable?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'overlay' | 'modal' | 'inline';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
}

const sizeClasses = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[32rem]',
};

const statusStyles = {
  loading: {
    icon: Loader2,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/50',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/50',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/50',
  },
};

export function ProgressOverlay({
  isOpen,
  title,
  description,
  progress,
  total,
  showPercentage = true,
  showProgressBar = true,
  status = 'loading',
  steps,
  currentStep,
  onCancel,
  onClose,
  cancelable = false,
  className,
  size = 'md',
  variant = 'overlay',
  autoClose = false,
  autoCloseDelay = 2000,
}: ProgressOverlayProps) {
  const [shouldAutoClose, setShouldAutoClose] = useState(false);

  const percentage = total ? Math.round((progress || 0 / total) * 100) : progress || 0;
  const isComplete = status === 'success' || percentage >= 100;
  const hasError = status === 'error';

  const statusConfig = statusStyles[status];
  const IconComponent = statusConfig.icon;

  // Auto-close logic
  useEffect(() => {
    if (autoClose && isComplete && !hasError) {
      setShouldAutoClose(true);
      const timer = setTimeout(() => {
        onClose?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, isComplete, hasError, autoCloseDelay, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  const content = (
    <Card className={cn('shadow-lg border-0', sizeClasses[size], className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={cn('p-2 rounded-full', statusConfig.bg)}>
              <IconComponent
                className={cn(
                  'h-5 w-5',
                  statusConfig.color,
                  status === 'loading' && 'animate-spin'
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {/* Close/Cancel button */}
          {(onClose || (cancelable && onCancel)) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose || onCancel}
              className="h-8 w-8 p-0 flex-shrink-0 ml-2"
              disabled={status === 'loading' && !cancelable}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress bar */}
        {showProgressBar && !steps && (
          <div className="mb-4">
            <Progress 
              value={percentage} 
              className="h-2"
            />
            {showPercentage && (
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {percentage}% concluído
                </span>
                {total && progress && (
                  <span>
                    {progress} de {total}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Steps */}
        {steps && (
          <div className="space-y-3 mb-4">
            {steps.map((step, index) => (
              <ProgressStepItem
                key={step.id}
                step={step}
                isActive={index === currentStep}
                isCompleted={step.status === 'completed'}
                isError={step.status === 'error'}
              />
            ))}
          </div>
        )}

        {/* Auto-close indicator */}
        {shouldAutoClose && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Fechando automaticamente em {Math.ceil(autoCloseDelay / 1000)} segundos...
          </div>
        )}

        {/* Action buttons */}
        {(hasError && onClose) && (
          <div className="flex justify-end mt-4">
            <Button onClick={onClose} size="sm">
              Fechar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Render based on variant
  if (variant === 'inline') {
    return content;
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative">
          {content}
        </div>
      </div>
    );
  }

  // Default overlay variant
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative">
        {content}
      </div>
    </div>
  );
}

// Progress Step Item Component
interface ProgressStepItemProps {
  step: ProgressStep;
  isActive: boolean;
  isCompleted: boolean;
  isError: boolean;
}

function ProgressStepItem({ step, isActive, isCompleted, isError }: ProgressStepItemProps) {
  const getIcon = () => {
    if (isError) return <XCircle className="h-4 w-4 text-red-500" />;
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isActive) return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    return <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />;
  };

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg transition-colors',
      isActive && 'bg-blue-50 dark:bg-blue-950/30',
      isCompleted && 'bg-green-50 dark:bg-green-950/30',
      isError && 'bg-red-50 dark:bg-red-950/30'
    )}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn(
          'text-sm font-medium',
          isActive && 'text-blue-900 dark:text-blue-100',
          isCompleted && 'text-green-900 dark:text-green-100',
          isError && 'text-red-900 dark:text-red-100',
          !isActive && !isCompleted && !isError && 'text-gray-600 dark:text-gray-400'
        )}>
          {step.label}
        </div>
        {step.description && (
          <div className={cn(
            'text-xs mt-1',
            isActive && 'text-blue-700 dark:text-blue-300',
            isCompleted && 'text-green-700 dark:text-green-300',
            isError && 'text-red-700 dark:text-red-300',
            !isActive && !isCompleted && !isError && 'text-gray-500 dark:text-gray-500'
          )}>
            {step.description}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact Progress Indicator (for corner/header display)
export interface CompactProgressProps {
  title: string;
  progress: number;
  total?: number;
  status?: 'loading' | 'success' | 'error';
  onCancel?: () => void;
  className?: string;
}

export function CompactProgress({
  title,
  progress,
  total,
  status = 'loading',
  onCancel,
  className,
}: CompactProgressProps) {
  const percentage = total ? Math.round((progress / total) * 100) : progress;
  const statusConfig = statusStyles[status];
  const IconComponent = statusConfig.icon;

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 bg-white dark:bg-gray-950 border rounded-lg shadow-sm',
      className
    )}>
      <IconComponent
        className={cn(
          'h-4 w-4 flex-shrink-0',
          statusConfig.color,
          status === 'loading' && 'animate-spin'
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {title}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          />
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
        {percentage}%
      </div>
      {onCancel && status === 'loading' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}