/**
 * Global Loading State Provider
 * 
 * Manages application-wide loading states with consistent UX patterns,
 * priority-based loading, progressive enhancement, and optimistic updates.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingOverlay } from '@/components/ui/loading-states';
import { StandardLoadingState } from '@/components/ui/ux-patterns';
import { getLoadingState } from '@/lib/ux-standards';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface LoadingOperation {
  id: string;
  label: string;
  type: 'page' | 'component' | 'mutation' | 'background';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress?: number;
  startTime: number;
  estimatedDuration?: number;
}

interface GlobalLoadingContextType {
  // Core loading state
  isLoading: boolean;
  operations: LoadingOperation[];
  
  // Operation management
  startLoading: (operation: Omit<LoadingOperation, 'startTime'>) => void;
  finishLoading: (operationId: string) => void;
  updateProgress: (operationId: string, progress: number) => void;
  
  // Utility methods
  isOperationLoading: (operationId: string) => boolean;
  getOperationProgress: (operationId: string) => number | undefined;
  hasCriticalOperation: () => boolean;
  getLoadingMessage: () => string;
  
  // Global states
  showGlobalOverlay: boolean;
  setShowGlobalOverlay: (show: boolean) => void;
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

// =============================================================================
// LOADING PRIORITY SYSTEM
// =============================================================================

const PRIORITY_WEIGHTS = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const LOADING_MESSAGES = {
  critical: 'Processando operação crítica...',
  high: 'Carregando dados importantes...',
  medium: 'Carregando...',
  low: 'Processando em segundo plano...'
};

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface GlobalLoadingProviderProps {
  children: ReactNode;
}

export function GlobalLoadingProvider({ children }: GlobalLoadingProviderProps) {
  const [operations, setOperations] = useState<LoadingOperation[]>([]);
  const [showGlobalOverlay, setShowGlobalOverlay] = useState(false);

  // Derived state
  const isLoading = operations.length > 0;
  
  // Start a loading operation
  const startLoading = useCallback((operation: Omit<LoadingOperation, 'startTime'>) => {
    const newOperation: LoadingOperation = {
      ...operation,
      startTime: Date.now()
    };
    
    setOperations(prev => {
      // Prevent duplicate operations
      const filtered = prev.filter(op => op.id !== operation.id);
      return [...filtered, newOperation].sort((a, b) => 
        PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority]
      );
    });
    
    // Show global overlay for critical operations
    if (operation.priority === 'critical') {
      setShowGlobalOverlay(true);
    }
  }, []);
  
  // Finish a loading operation
  const finishLoading = useCallback((operationId: string) => {
    setOperations(prev => {
      const filtered = prev.filter(op => op.id !== operationId);
      
      // Hide global overlay if no critical operations remain
      const hasCritical = filtered.some(op => op.priority === 'critical');
      if (!hasCritical) {
        setShowGlobalOverlay(false);
      }
      
      return filtered;
    });
  }, []);
  
  // Update operation progress
  const updateProgress = useCallback((operationId: string, progress: number) => {
    setOperations(prev => 
      prev.map(op => 
        op.id === operationId 
          ? { ...op, progress: Math.min(100, Math.max(0, progress)) }
          : op
      )
    );
  }, []);
  
  // Check if specific operation is loading
  const isOperationLoading = useCallback((operationId: string) => {
    return operations.some(op => op.id === operationId);
  }, [operations]);
  
  // Get operation progress
  const getOperationProgress = useCallback((operationId: string) => {
    const operation = operations.find(op => op.id === operationId);
    return operation?.progress;
  }, [operations]);
  
  // Check for critical operations
  const hasCriticalOperation = useCallback(() => {
    return operations.some(op => op.priority === 'critical');
  }, [operations]);
  
  // Get appropriate loading message
  const getLoadingMessage = useCallback(() => {
    if (operations.length === 0) return '';
    
    const highestPriority = operations[0]?.priority || 'medium';
    const operation = operations[0];
    
    // Use custom label if available, otherwise default message
    return operation?.label || LOADING_MESSAGES[highestPriority];
  }, [operations]);
  
  // Auto-cleanup operations that exceed expected duration
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setOperations(prev => 
        prev.filter(op => {
          const duration = now - op.startTime;
          const maxDuration = op.estimatedDuration ? op.estimatedDuration * 3 : 30000; // 30s default
          return duration < maxDuration;
        })
      );
    };
    
    const interval = setInterval(cleanup, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Context value
  const contextValue: GlobalLoadingContextType = {
    isLoading,
    operations,
    startLoading,
    finishLoading,
    updateProgress,
    isOperationLoading,
    getOperationProgress,
    hasCriticalOperation,
    getLoadingMessage,
    showGlobalOverlay,
    setShowGlobalOverlay
  };
  
  return (
    <GlobalLoadingContext.Provider value={contextValue}>
      {children}
      
      {/* Global Loading Overlay */}
      <AnimatePresence>
        {showGlobalOverlay && hasCriticalOperation() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-lg p-8 shadow-2xl min-w-80"
            >
              <StandardLoadingState
                config={{
                  type: 'progress',
                  size: 'lg',
                  text: getLoadingMessage(),
                  showProgress: true,
                  progress: operations[0]?.progress || 0
                }}
              />
              
              {operations.length > 1 && (
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  {operations.length - 1} outras operações em andamento
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading Indicator for Background Operations */}
      <AnimatePresence>
        {isLoading && !showGlobalOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-40"
          >
            <div className="bg-card border rounded-lg p-3 shadow-lg flex items-center gap-3 min-w-64">
              <StandardLoadingState
                config={{
                  type: 'dots',
                  size: 'sm',
                  text: ''
                }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{getLoadingMessage()}</div>
                {operations.length > 1 && (
                  <div className="text-xs text-muted-foreground">
                    {operations.length} operações ativas
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlobalLoadingContext.Provider>
  );
}

// =============================================================================
// CUSTOM HOOK
// =============================================================================

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook for managing page-level loading states
 */
export function usePageLoading(pageId: string) {
  const { startLoading, finishLoading, isOperationLoading } = useGlobalLoading();
  
  const setPageLoading = useCallback((loading: boolean, label?: string) => {
    if (loading) {
      startLoading({
        id: `page-${pageId}`,
        label: label || 'Carregando página...',
        type: 'page',
        priority: 'high',
        estimatedDuration: 3000
      });
    } else {
      finishLoading(`page-${pageId}`);
    }
  }, [pageId, startLoading, finishLoading]);
  
  return {
    isPageLoading: isOperationLoading(`page-${pageId}`),
    setPageLoading
  };
}

/**
 * Hook for managing mutation loading states with optimistic updates
 */
export function useMutationLoading() {
  const { startLoading, finishLoading, updateProgress } = useGlobalLoading();
  
  const startMutation = useCallback((id: string, label: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    startLoading({
      id: `mutation-${id}`,
      label,
      type: 'mutation',
      priority,
      estimatedDuration: 2000
    });
  }, [startLoading]);
  
  const finishMutation = useCallback((id: string) => {
    finishLoading(`mutation-${id}`);
  }, [finishLoading]);
  
  const updateMutationProgress = useCallback((id: string, progress: number) => {
    updateProgress(`mutation-${id}`, progress);
  }, [updateProgress]);
  
  return {
    startMutation,
    finishMutation,
    updateMutationProgress
  };
}

/**
 * Hook for component-level loading states
 */
export function useComponentLoading(componentId: string) {
  const { startLoading, finishLoading, isOperationLoading } = useGlobalLoading();
  
  const setComponentLoading = useCallback((loading: boolean, label?: string) => {
    if (loading) {
      startLoading({
        id: `component-${componentId}`,
        label: label || 'Carregando componente...',
        type: 'component',
        priority: 'medium',
        estimatedDuration: 2000
      });
    } else {
      finishLoading(`component-${componentId}`);
    }
  }, [componentId, startLoading, finishLoading]);
  
  return {
    isComponentLoading: isOperationLoading(`component-${componentId}`),
    setComponentLoading
  };
}