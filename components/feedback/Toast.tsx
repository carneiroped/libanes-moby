'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2, X, Undo2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ToastProps {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  progress?: number;
  undoable?: boolean;
  onUndo?: () => void;
}

const typeStyles = {
  success: {
    container: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    title: 'text-green-900 dark:text-green-100',
    description: 'text-green-700 dark:text-green-300',
    progress: 'bg-green-500',
  },
  error: {
    container: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-100',
    description: 'text-red-700 dark:text-red-300',
    progress: 'bg-red-500',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-900 dark:text-yellow-100',
    description: 'text-yellow-700 dark:text-yellow-300',
    progress: 'bg-yellow-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-100',
    description: 'text-blue-700 dark:text-blue-300',
    progress: 'bg-blue-500',
  },
  loading: {
    container: 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    title: 'text-gray-900 dark:text-gray-100',
    description: 'text-gray-700 dark:text-gray-300',
    progress: 'bg-gray-500',
  },
};

const typeIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

export function Toast({
  type,
  title,
  description,
  dismissible = true,
  action,
  onDismiss,
  className,
  showIcon = true,
  progress,
  undoable = false,
  onUndo,
}: ToastProps) {
  const styles = typeStyles[type];
  const IconComponent = typeIcons[type];

  const handleDismiss = () => {
    onDismiss?.();
  };

  const handleAction = () => {
    action?.onClick();
  };

  const handleUndo = () => {
    onUndo?.();
  };

  return (
    <div
      className={cn(
        // Base styles
        'relative overflow-hidden rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out',
        'animate-in slide-in-from-right-full',
        'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'data-[swipe=cancel]:translate-x-0',
        'data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full',
        // Type-specific styles
        styles.container,
        className
      )}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      {/* Progress bar */}
      {progress !== undefined && (
        <div className="absolute top-0 left-0 h-1 bg-black/10 dark:bg-white/10 w-full">
          <div
            className={cn('h-full transition-all duration-300 ease-out', styles.progress)}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        {showIcon && (
          <div className="flex-shrink-0 pt-0.5">
            <IconComponent
              className={cn(
                'h-5 w-5',
                type === 'loading' && 'animate-spin',
                styles.icon
              )}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={cn('text-sm font-semibold', styles.title)}>
            {title}
          </div>
          {description && (
            <div className={cn('mt-1 text-sm', styles.description)}>
              {description}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-3">
          {/* Undo button */}
          {undoable && onUndo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              className="h-8 px-2 hover:bg-black/10 dark:hover:bg-white/10"
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Desfazer
            </Button>
          )}

          {/* Custom action */}
          {action && (
            <Button
              variant={action.variant || 'default'}
              size="sm"
              onClick={handleAction}
              className="h-8 px-3"
            >
              {action.label}
            </Button>
          )}

          {/* Dismiss button */}
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Progress Toast Component
export interface ProgressToastProps {
  id: string;
  title: string;
  progress: number;
  total?: number;
  showPercentage?: boolean;
  onCancel?: () => void;
  className?: string;
}

export function ProgressToast({
  title,
  progress,
  total,
  showPercentage = true,
  onCancel,
  className,
}: ProgressToastProps) {
  const percentage = total ? Math.round((progress / total) * 100) : progress;
  const isComplete = percentage >= 100;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border p-4 shadow-lg bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800',
        'animate-in slide-in-from-right-full',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`${title} ${percentage}% concluído`}
    >
      <div className="flex items-center gap-3">
        {/* Loading icon */}
        <div className="flex-shrink-0">
          {isComplete ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </div>
          <div className="mt-2">
            {/* Progress bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300 ease-out',
                  isComplete 
                    ? 'bg-green-500' 
                    : 'bg-blue-500'
                )}
                style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
              />
            </div>
            {showPercentage && (
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {percentage}% {isComplete ? 'concluído' : 'processando'}
              </div>
            )}
          </div>
        </div>

        {/* Cancel button */}
        {onCancel && !isComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            aria-label="Cancelar operação"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Confirmation Toast Component
export interface ConfirmationToastProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export function ConfirmationToast({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
  className,
}: ConfirmationToastProps) {
  const variantStyles = {
    default: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-100',
      description: 'text-blue-700 dark:text-blue-300',
    },
    destructive: {
      container: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-900 dark:text-red-100',
      description: 'text-red-700 dark:text-red-300',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-900 dark:text-yellow-100',
      description: 'text-yellow-700 dark:text-yellow-300',
    },
  };

  const styles = variantStyles[variant];
  const IconComponent = variant === 'destructive' ? XCircle : variant === 'warning' ? AlertTriangle : Info;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-right-full',
        styles.container,
        className
      )}
      role="dialog"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          <IconComponent className={cn('h-5 w-5', styles.icon)} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={cn('text-sm font-semibold', styles.title)}>
            {title}
          </div>
          {description && (
            <div className={cn('mt-1 text-sm', styles.description)}>
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          size="sm"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}