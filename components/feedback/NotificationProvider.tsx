'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { notificationManager, ActivityEntry, NotificationOptions, ProgressNotificationOptions, ConfirmationOptions } from '@/lib/feedback/notification-manager';

interface NotificationContextType {
  // Basic notifications
  success: (message: string, options?: NotificationOptions) => string;
  error: (message: string, options?: NotificationOptions) => string;
  warning: (message: string, options?: NotificationOptions) => string;
  info: (message: string, options?: NotificationOptions) => string;
  loading: (message: string, options?: NotificationOptions) => string;
  
  // Advanced notifications
  progress: (id: string, options: ProgressNotificationOptions) => void;
  completeProgress: (id: string, successMessage?: string) => void;
  failProgress: (id: string, errorMessage: string) => void;
  
  // Promise-based notifications
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: NotificationOptions
  ) => Promise<T>;
  
  // Confirmation dialogs
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  
  // Control methods
  dismiss: (id: string) => void;
  dismissAll: () => void;
  
  // Activity feed
  activities: ActivityEntry[];
  clearActivities: () => void;
  getActivitiesByType: (type: ActivityEntry['type']) => ActivityEntry[];
  
  // Settings
  soundEnabled: boolean;
  hapticEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  
  // Scoped managers
  createScopedManager: (scope: string) => any;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  defaultSoundEnabled?: boolean;
  defaultHapticEnabled?: boolean;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  theme?: 'light' | 'dark' | 'system';
  richColors?: boolean;
  expand?: boolean;
  visibleToasts?: number;
  closeButton?: boolean;
  toastOptions?: {
    style?: React.CSSProperties;
    className?: string;
    duration?: number;
  };
}

export function NotificationProvider({
  children,
  defaultSoundEnabled = false,
  defaultHapticEnabled = false,
  position = 'top-right',
  theme = 'system',
  richColors = true,
  expand = false,
  visibleToasts = 5,
  closeButton = true,
  toastOptions,
}: NotificationProviderProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState(defaultSoundEnabled);
  const [hapticEnabled, setHapticEnabledState] = useState(defaultHapticEnabled);

  // Initialize settings
  useEffect(() => {
    notificationManager.setSoundEnabled(soundEnabled);
    notificationManager.setHapticEnabled(hapticEnabled);
  }, [soundEnabled, hapticEnabled]);

  // Subscribe to activity changes
  useEffect(() => {
    const unsubscribe = notificationManager.onActivityChange(() => {
      setActivities(notificationManager.getActivities());
    });

    // Initial load
    setActivities(notificationManager.getActivities());

    return unsubscribe;
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSoundEnabled = localStorage.getItem('notifications-sound-enabled');
      const savedHapticEnabled = localStorage.getItem('notifications-haptic-enabled');
      
      if (savedSoundEnabled !== null) {
        setSoundEnabledState(savedSoundEnabled === 'true');
      }
      
      if (savedHapticEnabled !== null) {
        setHapticEnabledState(savedHapticEnabled === 'true');
      }
    }
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    notificationManager.setSoundEnabled(enabled);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications-sound-enabled', String(enabled));
    }
  }, []);

  const setHapticEnabled = useCallback((enabled: boolean) => {
    setHapticEnabledState(enabled);
    notificationManager.setHapticEnabled(enabled);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications-haptic-enabled', String(enabled));
    }
  }, []);

  const contextValue: NotificationContextType = {
    // Basic notifications
    success: notificationManager.success.bind(notificationManager),
    error: notificationManager.error.bind(notificationManager),
    warning: notificationManager.warning.bind(notificationManager),
    info: notificationManager.info.bind(notificationManager),
    loading: notificationManager.loading.bind(notificationManager),
    
    // Advanced notifications
    progress: notificationManager.progress.bind(notificationManager),
    completeProgress: notificationManager.completeProgress.bind(notificationManager),
    failProgress: notificationManager.failProgress.bind(notificationManager),
    
    // Promise-based notifications
    promise: notificationManager.promise.bind(notificationManager),
    
    // Confirmation dialogs
    confirm: notificationManager.confirm.bind(notificationManager),
    
    // Control methods
    dismiss: notificationManager.dismiss.bind(notificationManager),
    dismissAll: notificationManager.dismissAll.bind(notificationManager),
    
    // Activity feed
    activities,
    clearActivities: notificationManager.clearActivities.bind(notificationManager),
    getActivitiesByType: notificationManager.getActivitiesByType.bind(notificationManager),
    
    // Settings
    soundEnabled,
    hapticEnabled,
    setSoundEnabled,
    setHapticEnabled,
    
    // Scoped managers
    createScopedManager: notificationManager.createScopedManager.bind(notificationManager),
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Toaster
        position={position}
        theme={theme}
        richColors={richColors}
        expand={expand}
        visibleToasts={visibleToasts}
        closeButton={closeButton}
        toastOptions={toastOptions}
        duration={4000}
        gap={8}
        offset={16}
        pauseWhenPageIsHidden
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Convenience hook for basic notifications
export function useNotify() {
  const { success, error, warning, info } = useNotifications();

  return React.useMemo(() => ({
    success,
    error,
    warning,
    info,
  }), [success, error, warning, info]);
}

// Hook for progress operations
export function useProgress() {
  const { progress, completeProgress, failProgress } = useNotifications();

  return React.useMemo(() => ({
    progress,
    completeProgress,
    failProgress,
    start: (id: string, label: string) => {
      progress(id, { progress: 0, label, showPercentage: true });
    },
    update: (id: string, progressValue: number, total?: number, label?: string) => {
      progress(id, { progress: progressValue, total, label, showPercentage: true });
    },
    complete: (id: string, message?: string) => {
      completeProgress(id, message);
    },
    fail: (id: string, message: string) => {
      failProgress(id, message);
    },
  }), [progress, completeProgress, failProgress]);
}

// Hook for confirmation dialogs
export function useConfirm() {
  const { confirm } = useNotifications();

  return React.useMemo(() => ({
    confirm,
    confirmDelete: async (itemName: string, onConfirm: () => void | Promise<void>) => {
      return confirm({
        title: `Excluir ${itemName}?`,
        description: 'Esta ação não pode ser desfeita.',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        variant: 'destructive',
        onConfirm,
      });
    },
    confirmAction: async (
      title: string,
      description: string,
      onConfirm: () => void | Promise<void>,
      variant: 'default' | 'destructive' | 'warning' = 'default'
    ) => {
      return confirm({
        title,
        description,
        variant,
        onConfirm,
      });
    },
  }), [confirm]);
}

// Hook for scoped notifications (useful for specific features/components)
export function useScopedNotifications(scope: string) {
  const notifications = useNotifications();
  
  return React.useMemo(() => {
    return notifications.createScopedManager(scope);
  }, [notifications, scope]);
}

// Hook for activity feed
export function useActivityFeed() {
  const { activities, clearActivities, getActivitiesByType } = useNotifications();
  
  return {
    activities,
    clearActivities,
    getActivitiesByType,
    recentActivities: activities.slice(0, 10),
    errorActivities: getActivitiesByType('error'),
    successActivities: getActivitiesByType('success'),
  };
}