'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNotifications } from '@/components/feedback/NotificationProvider';

export interface ProgressState {
  isActive: boolean;
  progress: number;
  total?: number;
  message: string;
  error?: string;
  startTime?: Date;
  estimatedDuration?: number;
}

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  weight?: number; // Weight for progress calculation
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

export interface UseProgressOptions {
  autoStart?: boolean;
  autoComplete?: boolean;
  autoReset?: boolean;
  showNotifications?: boolean;
  estimateDuration?: boolean;
  onComplete?: (duration: number) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

/**
 * Hook for managing progress operations with advanced features
 */
export function useProgress(
  operationId: string,
  initialMessage: string = 'Processando...',
  options: UseProgressOptions = {}
) {
  const {
    autoStart = false,
    autoComplete = true,
    autoReset = true,
    showNotifications = true,
    estimateDuration = true,
    onComplete,
    onError,
    onCancel,
  } = options;

  const notifications = useNotifications();
  const [state, setState] = useState<ProgressState>({
    isActive: false,
    progress: 0,
    message: initialMessage,
  });

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const startTimeRef = useRef<Date | undefined>(undefined);
  const estimatedEndTimeRef = useRef<Date | undefined>(undefined);

  // Start progress operation
  const start = useCallback((message?: string, total?: number) => {
    const startTime = new Date();
    startTimeRef.current = startTime;

    setState(prev => ({
      ...prev,
      isActive: true,
      progress: 0,
      total,
      message: message || initialMessage,
      error: undefined,
      startTime,
    }));

    if (showNotifications) {
      notifications.progress(operationId, {
        progress: 0,
        total,
        label: message || initialMessage,
        showPercentage: true,
      });
    }
  }, [operationId, initialMessage, showNotifications, notifications]);

  // Update progress
  const update = useCallback((
    progress: number,
    message?: string,
    total?: number
  ) => {
    setState(prev => {
      const newProgress = Math.max(0, Math.min(100, progress));
      let estimatedDuration: number | undefined;

      // Calculate estimated duration if enabled
      if (estimateDuration && startTimeRef.current && newProgress > 0) {
        const elapsed = Date.now() - startTimeRef.current.getTime();
        const estimatedTotal = (elapsed / newProgress) * 100;
        estimatedDuration = estimatedTotal;
        
        estimatedEndTimeRef.current = new Date(
          startTimeRef.current.getTime() + estimatedTotal
        );
      }

      return {
        ...prev,
        progress: newProgress,
        message: message || prev.message,
        total: total || prev.total,
        estimatedDuration,
      };
    });

    if (showNotifications) {
      notifications.progress(operationId, {
        progress,
        total: total || state.total,
        label: message || state.message,
        showPercentage: true,
      });
    }

    // Auto-complete when reaching 100%
    if (autoComplete && progress >= 100) {
      complete();
    }
  }, [operationId, autoComplete, estimateDuration, showNotifications, notifications, state.total, state.message]);

  // Increment progress
  const increment = useCallback((
    amount: number = 1,
    message?: string
  ) => {
    setState(prev => {
      const newProgress = Math.min(100, prev.progress + amount);
      update(newProgress, message);
      return prev;
    });
  }, [update]);

  // Set progress to specific value
  const setProgress = useCallback((
    progress: number,
    message?: string
  ) => {
    update(progress, message);
  }, [update]);

  // Complete progress operation
  const complete = useCallback((successMessage?: string) => {
    const duration = startTimeRef.current 
      ? Date.now() - startTimeRef.current.getTime()
      : 0;

    setState(prev => ({
      ...prev,
      isActive: false,
      progress: 100,
      message: successMessage || 'Concluído!',
    }));

    if (showNotifications) {
      notifications.completeProgress(
        operationId, 
        successMessage || `${initialMessage} concluído!`
      );
    }

    onComplete?.(duration);

    if (autoReset) {
      setTimeout(reset, 1000);
    }
  }, [operationId, initialMessage, showNotifications, notifications, onComplete, autoReset]);

  // Fail progress operation
  const fail = useCallback((errorMessage: string) => {
    setState(prev => ({
      ...prev,
      isActive: false,
      error: errorMessage,
      message: errorMessage,
    }));

    if (showNotifications) {
      notifications.failProgress(operationId, errorMessage);
    }

    onError?.(errorMessage);
  }, [operationId, showNotifications, notifications, onError]);

  // Cancel progress operation
  const cancel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      message: 'Cancelado',
    }));

    if (showNotifications) {
      notifications.failProgress(operationId, 'Operação cancelada');
    }

    onCancel?.();

    if (autoReset) {
      setTimeout(reset, 1000);
    }
  }, [operationId, showNotifications, notifications, onCancel, autoReset]);

  // Reset progress state
  const reset = useCallback(() => {
    setState({
      isActive: false,
      progress: 0,
      message: initialMessage,
    });
    startTimeRef.current = undefined;
    estimatedEndTimeRef.current = undefined;
  }, [initialMessage]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Control methods
    start,
    update,
    increment,
    setProgress,
    complete,
    fail,
    cancel,
    reset,
    
    // Computed properties
    percentage: state.progress,
    isComplete: state.progress >= 100,
    hasError: !!state.error,
    duration: startTimeRef.current ? Date.now() - startTimeRef.current.getTime() : 0,
    estimatedTimeRemaining: state.estimatedDuration && state.progress > 0
      ? Math.max(0, state.estimatedDuration - (Date.now() - (startTimeRef.current?.getTime() || 0)))
      : undefined,
  };
}

/**
 * Hook for managing stepped progress operations
 */
export function useSteppedProgress(
  operationId: string,
  steps: Omit<ProgressStep, 'status' | 'progress'>[],
  options: UseProgressOptions = {}
) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>(
    steps.map(step => ({
      ...step,
      status: 'pending',
      weight: step.weight || 1,
    }))
  );

  const totalWeight = progressSteps.reduce((sum, step) => sum + (step.weight || 1), 0);
  
  // Calculate overall progress based on step weights
  const calculateOverallProgress = useCallback(() => {
    let completedWeight = 0;
    let currentStepProgress = 0;

    progressSteps.forEach((step, index) => {
      if (step.status === 'completed') {
        completedWeight += step.weight || 1;
      } else if (index === currentStepIndex && step.status === 'active') {
        currentStepProgress = (step.progress || 0) * (step.weight || 1) / 100;
      }
    });

    return Math.round(((completedWeight + currentStepProgress) / totalWeight) * 100);
  }, [progressSteps, currentStepIndex, totalWeight]);

  const baseProgress = useProgress(operationId, 'Executando etapas...', options);

  // Start a specific step
  const startStep = useCallback((stepIndex: number, message?: string) => {
    setCurrentStepIndex(stepIndex);
    setProgressSteps(prev => prev.map((step, index) => ({
      ...step,
      status: index === stepIndex ? 'active' : 
             index < stepIndex ? 'completed' : 'pending',
      progress: index === stepIndex ? 0 : step.progress,
    })));

    const step = progressSteps[stepIndex];
    if (step) {
      baseProgress.update(
        calculateOverallProgress(),
        message || `Executando: ${step.label}`
      );
    }
  }, [progressSteps, calculateOverallProgress, baseProgress]);

  // Update current step progress
  const updateStepProgress = useCallback((
    progress: number,
    message?: string,
    stepIndex?: number
  ) => {
    const targetIndex = stepIndex ?? currentStepIndex;
    
    setProgressSteps(prev => prev.map((step, index) => 
      index === targetIndex 
        ? { ...step, progress: Math.max(0, Math.min(100, progress)) }
        : step
    ));

    baseProgress.update(calculateOverallProgress(), message);
  }, [currentStepIndex, calculateOverallProgress, baseProgress]);

  // Complete current step
  const completeStep = useCallback((stepIndex?: number) => {
    const targetIndex = stepIndex ?? currentStepIndex;
    
    setProgressSteps(prev => prev.map((step, index) =>
      index === targetIndex
        ? { ...step, status: 'completed', progress: 100 }
        : step
    ));

    // Move to next step or complete if this was the last step
    if (targetIndex < progressSteps.length - 1) {
      setCurrentStepIndex(targetIndex + 1);
    } else {
      baseProgress.complete('Todas as etapas concluídas!');
    }
  }, [currentStepIndex, progressSteps.length, baseProgress]);

  // Fail current step
  const failStep = useCallback((
    errorMessage: string,
    stepIndex?: number
  ) => {
    const targetIndex = stepIndex ?? currentStepIndex;
    
    setProgressSteps(prev => prev.map((step, index) =>
      index === targetIndex
        ? { ...step, status: 'error', error: errorMessage }
        : step
    ));

    baseProgress.fail(`Erro na etapa: ${errorMessage}`);
  }, [currentStepIndex, baseProgress]);

  // Start the stepped process
  const startSteppedProcess = useCallback((message?: string) => {
    baseProgress.start(message || 'Iniciando processo...');
    if (progressSteps.length > 0) {
      startStep(0);
    }
  }, [baseProgress, progressSteps.length, startStep]);

  // Reset all steps
  const resetSteps = useCallback(() => {
    setCurrentStepIndex(0);
    setProgressSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      progress: 0,
      error: undefined,
    })));
    baseProgress.reset();
  }, [baseProgress]);

  return {
    // Base progress properties
    ...baseProgress,
    
    // Step-specific properties
    steps: progressSteps,
    currentStepIndex,
    currentStep: progressSteps[currentStepIndex],
    completedSteps: progressSteps.filter(step => step.status === 'completed').length,
    
    // Step control methods
    startSteppedProcess,
    startStep,
    updateStepProgress,
    completeStep,
    failStep,
    resetSteps,
    
    // Computed properties
    overallProgress: calculateOverallProgress(),
    isLastStep: currentStepIndex === progressSteps.length - 1,
    hasFailedSteps: progressSteps.some(step => step.status === 'error'),
  };
}

/**
 * Hook for managing multiple concurrent progress operations
 */
export function useMultiProgress() {
  const [operations, setOperations] = useState<Map<string, ProgressState>>(new Map());
  const notifications = useNotifications();

  const addOperation = useCallback((id: string, message: string) => {
    setOperations(prev => new Map(prev).set(id, {
      isActive: true,
      progress: 0,
      message,
      startTime: new Date(),
    }));

    notifications.progress(id, {
      progress: 0,
      label: message,
      showPercentage: true,
    });
  }, [notifications]);

  const updateOperation = useCallback((
    id: string,
    progress: number,
    message?: string
  ) => {
    setOperations(prev => {
      const updated = new Map(prev);
      const existing = updated.get(id);
      if (existing) {
        updated.set(id, {
          ...existing,
          progress,
          message: message || existing.message,
        });

        notifications.progress(id, {
          progress,
          label: message || existing.message,
          showPercentage: true,
        });
      }
      return updated;
    });
  }, [notifications]);

  const completeOperation = useCallback((id: string, successMessage?: string) => {
    setOperations(prev => {
      const updated = new Map(prev);
      const existing = updated.get(id);
      if (existing) {
        updated.set(id, {
          ...existing,
          isActive: false,
          progress: 100,
        });

        notifications.completeProgress(id, successMessage || `${existing.message} concluído!`);
      }
      return updated;
    });
  }, [notifications]);

  const failOperation = useCallback((id: string, errorMessage: string) => {
    setOperations(prev => {
      const updated = new Map(prev);
      const existing = updated.get(id);
      if (existing) {
        updated.set(id, {
          ...existing,
          isActive: false,
          error: errorMessage,
        });

        notifications.failProgress(id, errorMessage);
      }
      return updated;
    });
  }, [notifications]);

  const removeOperation = useCallback((id: string) => {
    setOperations(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setOperations(prev => {
      const updated = new Map();
      prev.forEach((state, id) => {
        if (state.isActive) {
          updated.set(id, state);
        }
      });
      return updated;
    });
  }, []);

  return {
    operations: Array.from(operations.entries()).map(([id, state]) => ({ id, ...state })),
    activeOperations: Array.from(operations.entries())
      .filter(([, state]) => state.isActive)
      .map(([id, state]) => ({ id, ...state })),
    completedOperations: Array.from(operations.entries())
      .filter(([, state]) => !state.isActive && !state.error)
      .map(([id, state]) => ({ id, ...state })),
    failedOperations: Array.from(operations.entries())
      .filter(([, state]) => state.error)
      .map(([id, state]) => ({ id, ...state })),
    
    // Control methods
    addOperation,
    updateOperation,
    completeOperation,
    failOperation,
    removeOperation,
    clearCompleted,
    
    // Helper methods
    getOperation: (id: string) => operations.get(id),
    hasActiveOperations: Array.from(operations.values()).some(state => state.isActive),
    overallProgress: operations.size > 0
      ? Array.from(operations.values()).reduce((sum, state) => sum + state.progress, 0) / operations.size
      : 0,
  };
}