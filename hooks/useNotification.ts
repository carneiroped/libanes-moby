'use client';

import { useCallback } from 'react';
import { useNotifications } from '@/components/feedback/NotificationProvider';
import { NotificationOptions, ProgressNotificationOptions, ConfirmationOptions } from '@/lib/feedback/notification-manager';

/**
 * Main hook for accessing the notification system
 * Provides convenient methods for showing different types of notifications
 */
export function useNotification() {
  const notifications = useNotifications();

  return {
    // Basic notification methods
    success: notifications.success,
    error: notifications.error,
    warning: notifications.warning,
    info: notifications.info,
    loading: notifications.loading,
    
    // Advanced methods
    progress: notifications.progress,
    completeProgress: notifications.completeProgress,
    failProgress: notifications.failProgress,
    promise: notifications.promise,
    confirm: notifications.confirm,
    
    // Control methods
    dismiss: notifications.dismiss,
    dismissAll: notifications.dismissAll,
    
    // Activity methods
    activities: notifications.activities,
    clearActivities: notifications.clearActivities,
    getActivitiesByType: notifications.getActivitiesByType,
    
    // Settings
    soundEnabled: notifications.soundEnabled,
    hapticEnabled: notifications.hapticEnabled,
    setSoundEnabled: notifications.setSoundEnabled,
    setHapticEnabled: notifications.setHapticEnabled,
    
    // Scoped managers
    createScopedManager: notifications.createScopedManager,
  };
}

/**
 * Hook for common notification patterns with predefined options
 */
export function useNotify() {
  const { success, error, warning, info, promise } = useNotification();

  return {
    // Success notifications
    success: useCallback((message: string, options?: NotificationOptions) => {
      return success(message, {
        duration: 4000,
        ...options,
      });
    }, [success]),

    // Error notifications
    error: useCallback((message: string, options?: NotificationOptions) => {
      return error(message, {
        duration: 8000,
        important: true,
        ...options,
      });
    }, [error]),

    // Warning notifications  
    warning: useCallback((message: string, options?: NotificationOptions) => {
      return warning(message, {
        duration: 6000,
        ...options,
      });
    }, [warning]),

    // Info notifications
    info: useCallback((message: string, options?: NotificationOptions) => {
      return info(message, {
        duration: 4000,
        ...options,
      });
    }, [info]),

    // Save operation
    saved: useCallback((itemName?: string) => {
      return success(`${itemName || 'Item'} salvo com sucesso!`, {
        duration: 3000,
        action: {
          label: 'Visualizar',
          onClick: () => {/* Could navigate to item */}
        }
      });
    }, [success]),

    // Delete operation
    deleted: useCallback((itemName?: string, onUndo?: () => void) => {
      return success(`${itemName || 'Item'} excluído com sucesso!`, {
        duration: 5000,
        action: onUndo ? {
          label: 'Desfazer',
          onClick: onUndo
        } : undefined
      });
    }, [success]),

    // Update operation
    updated: useCallback((itemName?: string) => {
      return success(`${itemName || 'Item'} atualizado com sucesso!`, {
        duration: 3000,
      });
    }, [success]),

    // Created operation
    created: useCallback((itemName?: string, onView?: () => void) => {
      return success(`${itemName || 'Item'} criado com sucesso!`, {
        duration: 4000,
        action: onView ? {
          label: 'Visualizar',
          onClick: onView
        } : undefined
      });
    }, [success]),

    // Network error
    networkError: useCallback(() => {
      return error('Erro de conexão. Verifique sua internet.', {
        important: true,
        action: {
          label: 'Tentar novamente',
          onClick: () => window.location.reload()
        }
      });
    }, [error]),

    // Validation error
    validationError: useCallback((message?: string) => {
      return warning(message || 'Verifique os dados informados.', {
        duration: 5000,
      });
    }, [warning]),

    // Permission error
    permissionError: useCallback(() => {
      return error('Você não tem permissão para esta ação.', {
        duration: 6000,
      });
    }, [error]),

    // Server error
    serverError: useCallback((message?: string) => {
      return error(message || 'Erro interno do servidor. Tente novamente.', {
        important: true,
        duration: 8000,
        action: {
          label: 'Recarregar',
          onClick: () => window.location.reload()
        }
      });
    }, [error]),

    // Async operations with promises
    promiseOperation: useCallback(<T>(
      operation: Promise<T>,
      options: {
        loading?: string;
        success?: string | ((data: T) => string);
        error?: string | ((error: any) => string);
      }
    ) => {
      return promise(operation, {
        loading: options.loading || 'Processando...',
        success: options.success || 'Operação concluída!',
        error: options.error || 'Erro na operação'
      });
    }, [promise])
  };
}

/**
 * Hook for progress operations with predefined patterns
 */
export function useProgressNotification() {
  const { progress, completeProgress, failProgress } = useNotification();

  const createProgressOperation = useCallback((id: string, title: string) => {
    let currentProgress = 0;

    return {
      // Start progress
      start: () => {
        progress(id, {
          progress: 0,
          label: title,
          showPercentage: true
        });
      },

      // Update progress
      update: (value: number, total?: number, label?: string) => {
        currentProgress = total ? (value / total) * 100 : value;
        progress(id, {
          progress: currentProgress,
          total,
          label: label || title,
          showPercentage: true
        });
      },

      // Complete progress
      complete: (message?: string) => {
        completeProgress(id, message || `${title} concluído!`);
      },

      // Fail progress
      fail: (message?: string) => {
        failProgress(id, message || `Erro em ${title.toLowerCase()}`);
      },

      // Get current progress
      getCurrentProgress: () => currentProgress
    };
  }, [progress, completeProgress, failProgress]);

  return {
    // Create a progress operation
    createOperation: createProgressOperation,

    // File upload progress
    fileUpload: useCallback((fileName: string) => {
      return createProgressOperation(`upload-${fileName}`, `Upload ${fileName}`);
    }, [createProgressOperation]),

    // Data processing progress
    dataProcessing: useCallback((taskName: string) => {
      return createProgressOperation(`process-${taskName}`, `Processando ${taskName}`);
    }, [createProgressOperation]),

    // Import progress
    import: useCallback((itemType: string) => {
      return createProgressOperation(`import-${itemType}`, `Importando ${itemType}`);
    }, [createProgressOperation]),

    // Export progress
    export: useCallback((itemType: string) => {
      return createProgressOperation(`export-${itemType}`, `Exportando ${itemType}`);
    }, [createProgressOperation]),

    // Sync progress
    sync: useCallback((service: string) => {
      return createProgressOperation(`sync-${service}`, `Sincronizando ${service}`);
    }, [createProgressOperation]),

    // Backup progress
    backup: useCallback(() => {
      return createProgressOperation('backup', 'Criando backup');
    }, [createProgressOperation]),
  };
}

/**
 * Hook for confirmation dialogs with common patterns
 */
export function useConfirmation() {
  const { confirm } = useNotification();

  return {
    // Basic confirmation
    confirm: useCallback(async (
      title: string,
      description?: string,
      onConfirm?: () => void | Promise<void>
    ) => {
      if (!onConfirm) return false;
      
      return confirm({
        title,
        description,
        onConfirm,
      });
    }, [confirm]),

    // Delete confirmation
    confirmDelete: useCallback(async (
      itemName: string,
      onDelete: () => void | Promise<void>,
      description?: string
    ) => {
      return confirm({
        title: `Excluir ${itemName}?`,
        description: description || 'Esta ação não pode ser desfeita.',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        variant: 'destructive',
        onConfirm: onDelete,
      });
    }, [confirm]),

    // Discard changes confirmation
    confirmDiscardChanges: useCallback(async (
      onDiscard: () => void | Promise<void>
    ) => {
      return confirm({
        title: 'Descartar alterações?',
        description: 'As alterações não salvas serão perdidas.',
        confirmLabel: 'Descartar',
        cancelLabel: 'Continuar editando',
        variant: 'warning',
        onConfirm: onDiscard,
      });
    }, [confirm]),

    // Leave page confirmation
    confirmLeavePage: useCallback(async (
      onLeave: () => void | Promise<void>
    ) => {
      return confirm({
        title: 'Sair da página?',
        description: 'Você pode ter alterações não salvas.',
        confirmLabel: 'Sair',
        cancelLabel: 'Ficar',
        variant: 'warning',
        onConfirm: onLeave,
      });
    }, [confirm]),

    // Logout confirmation
    confirmLogout: useCallback(async (
      onLogout: () => void | Promise<void>
    ) => {
      return confirm({
        title: 'Fazer logout?',
        description: 'Você precisará fazer login novamente.',
        confirmLabel: 'Logout',
        cancelLabel: 'Cancelar',
        onConfirm: onLogout,
      });
    }, [confirm]),

    // Reset data confirmation
    confirmReset: useCallback(async (
      itemName: string,
      onReset: () => void | Promise<void>
    ) => {
      return confirm({
        title: `Resetar ${itemName}?`,
        description: 'Todos os dados serão restaurados para os valores padrão.',
        confirmLabel: 'Resetar',
        cancelLabel: 'Cancelar',
        variant: 'warning',
        onConfirm: onReset,
      });
    }, [confirm]),

    // Publish confirmation
    confirmPublish: useCallback(async (
      itemName: string,
      onPublish: () => void | Promise<void>
    ) => {
      return confirm({
        title: `Publicar ${itemName}?`,
        description: 'O item ficará visível publicamente.',
        confirmLabel: 'Publicar',
        cancelLabel: 'Cancelar',
        onConfirm: onPublish,
      });
    }, [confirm]),
  };
}

/**
 * Hook for scoped notifications (useful for specific features/components)
 */
export function useScopedNotification(scope: string) {
  const notifications = useNotifications();

  return notifications.createScopedManager(scope);
}

// Export common patterns as standalone hooks
export { useNotify as useToast };
export { useProgressNotification as useProgress };  
export { useConfirmation as useConfirm };
export { useScopedNotification as useNotificationScope };