/**
 * Progressive Loading Hook
 * 
 * Implements progressive loading patterns with priority-based content loading,
 * skeleton-to-content transitions, and optimistic updates for better UX.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGlobalLoading } from '@/providers/global-loading-provider';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface LoadingStage {
  id: string;
  label: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration?: number;
  data?: any;
  error?: Error;
  completed: boolean;
}

interface ProgressiveLoadingConfig {
  id: string;
  stages: Omit<LoadingStage, 'completed' | 'data' | 'error'>[];
  autoStart?: boolean;
  showProgress?: boolean;
  onStageComplete?: (stageId: string, data: any) => void;
  onAllComplete?: (allData: Record<string, any>) => void;
  onError?: (stageId: string, error: Error) => void;
}

interface ProgressiveLoadingState {
  isLoading: boolean;
  currentStage: string | null;
  completedStages: string[];
  progress: number;
  data: Record<string, any>;
  errors: Record<string, Error>;
  hasErrors: boolean;
}

// =============================================================================
// PROGRESSIVE LOADING HOOK
// =============================================================================

export function useProgressiveLoading(config: ProgressiveLoadingConfig) {
  const { startLoading, finishLoading, updateProgress } = useGlobalLoading();
  const [stages, setStages] = useState<LoadingStage[]>(
    config.stages.map(stage => ({ ...stage, completed: false }))
  );
  
  const [state, setState] = useState<ProgressiveLoadingState>({
    isLoading: false,
    currentStage: null,
    completedStages: [],
    progress: 0,
    data: {},
    errors: {},
    hasErrors: false
  });
  
  const loadersRef = useRef<Map<string, () => Promise<any>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Register data loader for a stage
  const registerLoader = useCallback((stageId: string, loader: () => Promise<any>) => {
    loadersRef.current.set(stageId, loader);
  }, []);
  
  // Update progress calculation
  const updateProgressCalculation = useCallback(() => {
    const completedCount = stages.filter(stage => stage.completed).length;
    const totalCount = stages.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    setState(prev => ({ ...prev, progress }));
    
    if (config.showProgress) {
      updateProgress(`progressive-${config.id}`, progress);
    }
  }, [stages, config.id, config.showProgress, updateProgress]);
  
  // Start loading a specific stage
  const loadStage = useCallback(async (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage || stage.completed) return;
    
    const loader = loadersRef.current.get(stageId);
    if (!loader) {
      console.warn(`No loader registered for stage: ${stageId}`);
      return;
    }
    
    setState(prev => ({ ...prev, currentStage: stageId }));
    
    try {
      const data = await loader();
      
      // Update stage completion
      setStages(prev => 
        prev.map(s => 
          s.id === stageId 
            ? { ...s, completed: true, data }
            : s
        )
      );
      
      // Update state
      setState(prev => ({
        ...prev,
        data: { ...prev.data, [stageId]: data },
        completedStages: [...prev.completedStages, stageId],
        currentStage: null
      }));
      
      // Call stage complete callback
      config.onStageComplete?.(stageId, data);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      setStages(prev => 
        prev.map(s => 
          s.id === stageId 
            ? { ...s, error: err }
            : s
        )
      );
      
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [stageId]: err },
        hasErrors: true,
        currentStage: null
      }));
      
      config.onError?.(stageId, err);
    }
  }, [stages, config]);
  
  // Start progressive loading
  const startProgressiveLoading = useCallback(async () => {
    if (state.isLoading) return;
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      completedStages: [],
      data: {},
      errors: {},
      hasErrors: false,
      progress: 0
    }));
    
    // Reset stages
    setStages(prev => prev.map(stage => ({ 
      ...stage, 
      completed: false, 
      data: undefined, 
      error: undefined 
    })));
    
    // Create abort controller
    abortControllerRef.current = new AbortController();
    
    // Start global loading
    startLoading({
      id: `progressive-${config.id}`,
      label: 'Carregando dados...',
      type: 'page',
      priority: 'high',
      progress: 0
    });
    
    // Sort stages by priority
    const sortedStages = [...stages].sort((a, b) => {
      const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
    
    // Load critical and high priority stages first (parallel)
    const criticalStages = sortedStages.filter(s => s.priority === 'critical' || s.priority === 'high');
    const normalStages = sortedStages.filter(s => s.priority === 'medium' || s.priority === 'low');
    
    try {
      // Load critical stages in parallel
      if (criticalStages.length > 0) {
        await Promise.all(
          criticalStages.map(stage => loadStage(stage.id))
        );
      }
      
      // Load normal stages sequentially to avoid overwhelming the system
      for (const stage of normalStages) {
        if (abortControllerRef.current?.signal.aborted) break;
        await loadStage(stage.id);
      }
      
      // Check if all stages completed successfully
      const allCompleted = stages.every(stage => 
        stages.find(s => s.id === stage.id)?.completed || 
        state.completedStages.includes(stage.id)
      );
      
      if (allCompleted) {
        config.onAllComplete?.(state.data);
      }
      
    } catch (error) {
      console.error('Progressive loading failed:', error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false, currentStage: null }));
      finishLoading(`progressive-${config.id}`);
    }
  }, [state.isLoading, stages, config, startLoading, finishLoading, loadStage, state.data, state.completedStages]);
  
  // Stop loading and cleanup
  const stopProgressiveLoading = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(prev => ({ ...prev, isLoading: false, currentStage: null }));
    finishLoading(`progressive-${config.id}`);
  }, [config.id, finishLoading]);
  
  // Retry failed stages
  const retryFailedStages = useCallback(async () => {
    const failedStages = stages.filter(stage => stage.error && !stage.completed);
    
    for (const stage of failedStages) {
      await loadStage(stage.id);
    }
  }, [stages, loadStage]);
  
  // Get stage data
  const getStageData = useCallback((stageId: string) => {
    return state.data[stageId];
  }, [state.data]);
  
  // Check if stage is complete
  const isStageComplete = useCallback((stageId: string) => {
    return state.completedStages.includes(stageId);
  }, [state.completedStages]);
  
  // Check if stage has error
  const getStageError = useCallback((stageId: string) => {
    return state.errors[stageId];
  }, [state.errors]);
  
  // Update progress when stages change
  useEffect(() => {
    updateProgressCalculation();
  }, [updateProgressCalculation]);
  
  // Auto-start if enabled
  useEffect(() => {
    if (config.autoStart && !state.isLoading) {
      startProgressiveLoading();
    }
  }, [config.autoStart, state.isLoading, startProgressiveLoading]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressiveLoading();
    };
  }, [stopProgressiveLoading]);
  
  return {
    // State
    ...state,
    stages,
    
    // Actions
    startLoading: startProgressiveLoading,
    stopLoading: stopProgressiveLoading,
    retryFailedStages,
    registerLoader,
    
    // Getters
    getStageData,
    isStageComplete,
    getStageError,
    
    // Utilities
    hasCompletedCriticalStages: () => 
      stages.filter(s => s.priority === 'critical').every(s => s.completed),
    hasCompletedHighPriorityStages: () =>
      stages.filter(s => s.priority === 'high' || s.priority === 'critical').every(s => s.completed),
    getTotalStages: () => stages.length,
    getCompletedStagesCount: () => state.completedStages.length
  };
}

// =============================================================================
// OPTIMISTIC UPDATES HOOK
// =============================================================================

interface OptimisticUpdate<T> {
  id: string;
  data: Partial<T>;
  rollback: T;
  timestamp: number;
}

export function useOptimisticUpdates<T extends { id: string }>() {
  const [updates, setUpdates] = useState<Map<string, OptimisticUpdate<T>>>(new Map());
  
  // Apply optimistic update
  const applyOptimisticUpdate = useCallback((id: string, update: Partial<T>, originalData: T) => {
    const optimisticUpdate: OptimisticUpdate<T> = {
      id,
      data: update,
      rollback: originalData,
      timestamp: Date.now()
    };
    
    setUpdates(prev => new Map(prev.set(id, optimisticUpdate)));
  }, []);
  
  // Confirm optimistic update (remove from pending)
  const confirmOptimisticUpdate = useCallback((id: string) => {
    setUpdates(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  }, []);
  
  // Rollback optimistic update
  const rollbackOptimisticUpdate = useCallback((id: string) => {
    setUpdates(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  }, []);
  
  // Get optimistic data for item
  const getOptimisticData = useCallback((item: T): T => {
    const update = updates.get(item.id);
    return update ? { ...item, ...update.data } : item;
  }, [updates]);
  
  // Apply optimistic updates to array
  const applyOptimisticUpdatesToArray = useCallback((items: T[]): T[] => {
    return items.map(item => getOptimisticData(item));
  }, [getOptimisticData]);
  
  // Check if item has pending update
  const hasPendingUpdate = useCallback((id: string) => {
    return updates.has(id);
  }, [updates]);
  
  // Get pending updates count
  const getPendingUpdatesCount = useCallback(() => {
    return updates.size;
  }, [updates]);
  
  // Cleanup old updates (older than 30 seconds)
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setUpdates(prev => {
        const updated = new Map(prev);
        for (const [id, update] of updated.entries()) {
          if (now - update.timestamp > 30000) {
            updated.delete(id);
          }
        }
        return updated;
      });
    };
    
    const interval = setInterval(cleanup, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return {
    applyOptimisticUpdate,
    confirmOptimisticUpdate,
    rollbackOptimisticUpdate,
    getOptimisticData,
    applyOptimisticUpdatesToArray,
    hasPendingUpdate,
    getPendingUpdatesCount,
    pendingUpdates: Array.from(updates.values())
  };
}

// =============================================================================
// SKELETON TRANSITION HOOK
// =============================================================================

interface SkeletonTransitionConfig {
  minLoadingTime?: number; // Minimum time to show skeleton
  fadeOutDuration?: number; // Fade transition duration
}

export function useSkeletonTransition(
  isLoading: boolean, 
  config: SkeletonTransitionConfig = {}
) {
  const { minLoadingTime = 300, fadeOutDuration = 200 } = config;
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setShowSkeleton(true);
      setIsTransitioning(false);
    } else if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      if (remainingTime > 0) {
        setTimeout(() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setShowSkeleton(false);
            setIsTransitioning(false);
          }, fadeOutDuration);
        }, remainingTime);
      } else {
        setIsTransitioning(true);
        setTimeout(() => {
          setShowSkeleton(false);
          setIsTransitioning(false);
        }, fadeOutDuration);
      }
    }
  }, [isLoading, minLoadingTime, fadeOutDuration]);
  
  return {
    showSkeleton,
    isTransitioning,
    shouldShowContent: !isLoading && !showSkeleton
  };
}