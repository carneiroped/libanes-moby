'use client';

import { toast as sonnerToast, ExternalToast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'promise';

export interface NotificationOptions extends ExternalToast {
  type?: NotificationType;
  title?: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
  important?: boolean;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  icon?: React.ReactNode;
  className?: string;
}

export interface ProgressNotificationOptions extends Omit<NotificationOptions, 'type'> {
  progress: number;
  total?: number;
  label?: string;
  showPercentage?: boolean;
}

export interface ConfirmationOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ActivityEntry {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
  undoable?: boolean;
  onUndo?: () => void | Promise<void>;
}

class NotificationManager {
  private activities: ActivityEntry[] = [];
  private activityListeners: Set<() => void> = new Set();
  private pendingOperations: Map<string, { dismiss: () => void; update: (data: any) => void }> = new Map();
  private soundEnabled: boolean = false;
  private hapticEnabled: boolean = false;

  /**
   * Show a success notification
   */
  success(message: string, options?: NotificationOptions): string {
    const id = sonnerToast.success(message, {
      ...options,
      duration: options?.duration ?? 4000,
      dismissible: options?.dismissible ?? true,
    });

    this.addActivity({
      id: String(id),
      type: 'success',
      title: message,
      description: options?.description,
      timestamp: new Date(),
      undoable: options?.action?.onClick ? true : false,
      onUndo: options?.action?.onClick,
    });

    this.playSound('success');
    this.playHaptic('light');

    return String(id);
  }

  /**
   * Show an error notification
   */
  error(message: string, options?: NotificationOptions): string {
    const id = sonnerToast.error(message, {
      ...options,
      duration: options?.important ? Infinity : (options?.duration ?? 8000),
      dismissible: true,
    });

    this.addActivity({
      id: String(id),
      type: 'error',
      title: message,
      description: options?.description,
      timestamp: new Date(),
    });

    this.playSound('error');
    this.playHaptic('medium');

    return String(id);
  }

  /**
   * Show a warning notification
   */
  warning(message: string, options?: NotificationOptions): string {
    const id = sonnerToast.warning(message, {
      ...options,
      duration: options?.duration ?? 6000,
      dismissible: options?.dismissible ?? true,
    });

    this.addActivity({
      id: String(id),
      type: 'warning',
      title: message,
      description: options?.description,
      timestamp: new Date(),
    });

    this.playSound('warning');
    this.playHaptic('light');

    return String(id);
  }

  /**
   * Show an info notification
   */
  info(message: string, options?: NotificationOptions): string {
    const id = sonnerToast.info(message, {
      ...options,
      duration: options?.duration ?? 4000,
      dismissible: options?.dismissible ?? true,
    });

    this.addActivity({
      id: String(id),
      type: 'info',
      title: message,
      description: options?.description,
      timestamp: new Date(),
    });

    this.playSound('info');

    return String(id);
  }

  /**
   * Show a loading notification
   */
  loading(message: string, options?: NotificationOptions): string {
    const id = sonnerToast.loading(message, {
      ...options,
      duration: Infinity,
      dismissible: false,
    });

    return String(id);
  }

  /**
   * Show a progress notification
   */
  progress(id: string, options: ProgressNotificationOptions): void {
    const percentage = options.total ? Math.round((options.progress / options.total) * 100) : options.progress;
    const message = options.showPercentage !== false 
      ? `${options.label || 'Processando'}: ${percentage}%`
      : options.label || 'Processando...';

    if (this.pendingOperations.has(id)) {
      // Update existing notification
      const operation = this.pendingOperations.get(id);
      operation?.update({
        ...options,
        description: message,
      });
    } else {
      // Create new progress notification
      const toastId = sonnerToast.loading(message, {
        ...options,
        duration: Infinity,
        dismissible: false,
      });

      this.pendingOperations.set(id, {
        dismiss: () => sonnerToast.dismiss(toastId),
        update: (data: any) => sonnerToast.loading(data.description, { id: toastId, ...data }),
      });
    }

    // Auto-complete when progress reaches 100%
    if (percentage >= 100) {
      setTimeout(() => {
        this.completeProgress(id, 'Concluído com sucesso!');
      }, 500);
    }
  }

  /**
   * Complete a progress operation
   */
  completeProgress(id: string, successMessage?: string): void {
    const operation = this.pendingOperations.get(id);
    if (operation) {
      operation.dismiss();
      this.pendingOperations.delete(id);

      if (successMessage) {
        this.success(successMessage);
      }
    }
  }

  /**
   * Fail a progress operation
   */
  failProgress(id: string, errorMessage: string): void {
    const operation = this.pendingOperations.get(id);
    if (operation) {
      operation.dismiss();
      this.pendingOperations.delete(id);
      this.error(errorMessage);
    }
  }

  /**
   * Show a promise-based notification
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: NotificationOptions
  ): Promise<T> {
    const id = String(Date.now());
    
    sonnerToast.promise(promise, {
      loading: messages.loading,
      success: (data: T) => {
        const message = typeof messages.success === 'function' ? messages.success(data) : messages.success;
        this.addActivity({
          id,
          type: 'success',
          title: message,
          timestamp: new Date(),
        });
        this.playSound('success');
        this.playHaptic('light');
        return message;
      },
      error: (error: Error) => {
        const message = typeof messages.error === 'function' ? messages.error(error) : messages.error;
        this.addActivity({
          id,
          type: 'error',
          title: message,
          timestamp: new Date(),
        });
        this.playSound('error');
        this.playHaptic('medium');
        return message;
      },
    } as any);

    return promise;
  }

  /**
   * Show a confirmation dialog
   */
  async confirm(options: ConfirmationOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const id = sonnerToast(options.title, {
        description: options.description,
        duration: Infinity,
        dismissible: false,
        action: {
          label: options.confirmLabel || 'Confirmar',
          onClick: async () => {
            try {
              await options.onConfirm();
              sonnerToast.dismiss(id);
              resolve(true);
            } catch (error) {
              this.error('Erro ao executar ação');
              resolve(false);
            }
          },
        },
        cancel: {
          label: options.cancelLabel || 'Cancelar',
          onClick: () => {
            options.onCancel?.();
            sonnerToast.dismiss(id);
            resolve(false);
          },
        },
      });
    });
  }

  /**
   * Dismiss a specific notification
   */
  dismiss(id: string): void {
    sonnerToast.dismiss(id);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    sonnerToast.dismiss();
  }

  /**
   * Add an entry to the activity feed
   */
  private addActivity(activity: ActivityEntry): void {
    this.activities.unshift(activity);
    
    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100);
    }

    // Notify listeners
    this.activityListeners.forEach(listener => listener());
  }

  /**
   * Get all activities
   */
  getActivities(): ActivityEntry[] {
    return [...this.activities];
  }

  /**
   * Get activities by type
   */
  getActivitiesByType(type: ActivityEntry['type']): ActivityEntry[] {
    return this.activities.filter(activity => activity.type === type);
  }

  /**
   * Clear all activities
   */
  clearActivities(): void {
    this.activities = [];
    this.activityListeners.forEach(listener => listener());
  }

  /**
   * Subscribe to activity changes
   */
  onActivityChange(listener: () => void): () => void {
    this.activityListeners.add(listener);
    return () => this.activityListeners.delete(listener);
  }

  /**
   * Enable/disable sound feedback
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  /**
   * Enable/disable haptic feedback
   */
  setHapticEnabled(enabled: boolean): void {
    this.hapticEnabled = enabled;
  }

  /**
   * Play notification sound
   */
  private playSound(type: 'success' | 'error' | 'warning' | 'info'): void {
    if (!this.soundEnabled || typeof window === 'undefined') return;

    try {
      const audio = new Audio();
      switch (type) {
        case 'success':
          audio.src = '/sounds/success.mp3';
          break;
        case 'error':
          audio.src = '/sounds/error.mp3';
          break;
        case 'warning':
          audio.src = '/sounds/warning.mp3';
          break;
        case 'info':
          audio.src = '/sounds/info.mp3';
          break;
      }
      
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });
    } catch (error) {
      // Ignore audio errors
    }
  }

  /**
   * Play haptic feedback
   */
  private playHaptic(intensity: 'light' | 'medium' | 'heavy'): void {
    if (!this.hapticEnabled || typeof window === 'undefined' || !('vibrate' in navigator)) return;

    try {
      switch (intensity) {
        case 'light':
          navigator.vibrate(50);
          break;
        case 'medium':
          navigator.vibrate(100);
          break;
        case 'heavy':
          navigator.vibrate([100, 50, 100]);
          break;
      }
    } catch (error) {
      // Ignore vibration errors
    }
  }

  /**
   * Create a scoped notification manager for a specific context
   */
  createScopedManager(scope: string) {
    return {
      success: (message: string, options?: NotificationOptions) => 
        this.success(`[${scope}] ${message}`, options),
      error: (message: string, options?: NotificationOptions) => 
        this.error(`[${scope}] ${message}`, options),
      warning: (message: string, options?: NotificationOptions) => 
        this.warning(`[${scope}] ${message}`, options),
      info: (message: string, options?: NotificationOptions) => 
        this.info(`[${scope}] ${message}`, options),
      loading: (message: string, options?: NotificationOptions) => 
        this.loading(`[${scope}] ${message}`, options),
      progress: (id: string, options: ProgressNotificationOptions) => 
        this.progress(`${scope}-${id}`, options),
    };
  }
}

// Create and export the singleton instance
export const notificationManager = new NotificationManager();

// Export individual methods for convenience
export const {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  progress: showProgress,
  promise: showPromise,
  confirm: showConfirmation,
  dismiss,
  dismissAll,
} = notificationManager;

export default notificationManager;