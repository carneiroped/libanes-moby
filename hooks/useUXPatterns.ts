/**
 * UX Patterns Hooks for Moby CRM
 * 
 * Collection of custom hooks for common UX patterns including
 * real-time validation, pagination, search/debounce, conflict detection,
 * feedback systems, and drag & drop functionality.
 */

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  UX_CONFIG, 
  FEEDBACK_MESSAGES,
  ValidationRule,
  FeedbackConfig,
  FeedbackType 
} from '@/lib/ux-standards';
import { 
  PaginationState, 
  FilterState, 
  AsyncState,
  ValidationRule as CommonValidationRule 
} from '@/types/common.types';

// =============================================================================
// REAL-TIME VALIDATION HOOK
// =============================================================================

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  validatedFields: Set<string>;
}

interface UseRealTimeValidationOptions {
  initialValues?: Record<string, any>;
  validationRules?: Record<string, ValidationRule[]>;
  debounceDelay?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useRealTimeValidation({
  initialValues = {},
  validationRules = {},
  debounceDelay = UX_CONFIG.VALIDATION.REALTIME_DELAY,
  validateOnChange = true,
  validateOnBlur = true,
}: UseRealTimeValidationOptions = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [validatedFields, setValidatedFields] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const validationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const validateField = useCallback(async (fieldName: string, value: any): Promise<string | null> => {
    const rules = validationRules[fieldName] || [];
    
    for (const rule of rules) {
      try {
        if (rule.validator) {
          const isValid = await rule.validator(value);
          if (!isValid) {
            return rule.message;
          }
        } else {
          // Handle built-in validation types
          switch (rule.type) {
            case 'required':
              if (!value || (typeof value === 'string' && value.trim() === '')) {
                return rule.message;
              }
              break;
            case 'email':
              if (value && !UX_CONFIG.VALIDATION.EMAIL_PATTERN.test(value)) {
                return rule.message;
              }
              break;
            case 'phone':
              if (value && !UX_CONFIG.VALIDATION.PHONE_PATTERN.test(value)) {
                return rule.message;
              }
              break;
            case 'min':
              if (value && value.length < rule.value) {
                return rule.message;
              }
              break;
            case 'max':
              if (value && value.length > rule.value) {
                return rule.message;
              }
              break;
            case 'pattern':
              if (value && rule.value && !rule.value.test(value)) {
                return rule.message;
              }
              break;
          }
        }
      } catch (error) {
        console.error(`Validation error for field ${fieldName}:`, error);
        return 'Erro na validação';
      }
    }
    
    return null;
  }, [validationRules]);

  const validateFieldWithDelay = useCallback((fieldName: string, value: any) => {
    // Clear existing timeout
    if (validationTimeouts.current[fieldName]) {
      clearTimeout(validationTimeouts.current[fieldName]);
    }
    
    // Set new timeout for validation
    validationTimeouts.current[fieldName] = setTimeout(async () => {
      setIsValidating(true);
      const error = await validateField(fieldName, value);
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || ''
      }));
      
      setValidatedFields(prev => new Set([...prev, fieldName]));
      setIsValidating(false);
    }, debounceDelay);
  }, [validateField, debounceDelay]);

  const setValue = useCallback((fieldName: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    if (validateOnChange) {
      validateFieldWithDelay(fieldName, value);
    }
  }, [validateOnChange, validateFieldWithDelay]);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const validateAllFields = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    const newErrors: Record<string, string> = {};
    
    for (const [fieldName, value] of Object.entries(values)) {
      const error = await validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
      }
    }
    
    setErrors(newErrors);
    setValidatedFields(new Set(Object.keys(values)));
    setIsValidating(false);
    
    return Object.keys(newErrors).length === 0;
  }, [values, validateField]);

  const resetValidation = useCallback(() => {
    setErrors({});
    setWarnings({});
    setValidatedFields(new Set());
    setIsValidating(false);
    
    // Clear all timeouts
    Object.values(validationTimeouts.current).forEach(timeout => {
      clearTimeout(timeout);
    });
    validationTimeouts.current = {};
  }, []);

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return {
    values,
    errors,
    warnings,
    validatedFields,
    isValidating,
    isValid,
    setValue,
    setFieldError,
    clearFieldError,
    validateField,
    validateAllFields,
    resetValidation
  };
}

// =============================================================================
// PAGINATION HOOK
// =============================================================================

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
  maxPageSize?: number;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = UX_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  total = 0,
  maxPageSize = UX_CONFIG.PAGINATION.MAX_PAGE_SIZE
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(
    Math.min(initialPageSize, maxPageSize)
  );

  const totalPages = Math.ceil(total / pageSize);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, total - 1);

  const goToPage = useCallback((targetPage: number) => {
    const normalizedPage = Math.max(1, Math.min(targetPage, totalPages));
    setPage(normalizedPage);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (hasNext) {
      setPage(prev => prev + 1);
    }
  }, [hasNext]);

  const goToPrevPage = useCallback(() => {
    if (hasPrev) {
      setPage(prev => prev - 1);
    }
  }, [hasPrev]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  const changePageSize = useCallback((newSize: number) => {
    const validSize = Math.min(Math.max(1, newSize), maxPageSize);
    setPageSize(validSize);
    
    // Adjust current page to maintain roughly the same position
    const currentItemStart = (page - 1) * pageSize;
    const newPage = Math.floor(currentItemStart / validSize) + 1;
    setPage(Math.max(1, Math.min(newPage, Math.ceil(total / validSize))));
  }, [page, pageSize, total, maxPageSize]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(Math.min(initialPageSize, maxPageSize));
  }, [initialPage, initialPageSize, maxPageSize]);

  const paginationState: PaginationState = {
    page,
    limit: pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev
  };

  return {
    ...paginationState,
    startIndex,
    endIndex,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    reset
  };
}

// =============================================================================
// DEBOUNCE HOOK
// =============================================================================

export function useDebounce<T>(value: T, delay: number = UX_CONFIG.SEARCH.DEBOUNCE_DELAY): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// SEARCH HOOK
// =============================================================================

interface UseSearchOptions {
  debounceDelay?: number;
  minQueryLength?: number;
  maxRecentSearches?: number;
  onSearch?: (query: string) => void | Promise<void>;
}

export function useSearch({
  debounceDelay = UX_CONFIG.SEARCH.DEBOUNCE_DELAY,
  minQueryLength = UX_CONFIG.SEARCH.MIN_QUERY_LENGTH,
  maxRecentSearches = UX_CONFIG.SEARCH.MAX_RECENT_SEARCHES,
  onSearch
}: UseSearchOptions = {}) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedQuery = useDebounce(query, debounceDelay);

  useEffect(() => {
    if (debouncedQuery.length >= minQueryLength) {
      if (onSearch) {
        setIsSearching(true);
        Promise.resolve(onSearch(debouncedQuery)).finally(() => {
          setIsSearching(false);
        });
      }
    }
  }, [debouncedQuery, minQueryLength, onSearch]);

  const addToRecentSearches = useCallback((searchQuery: string) => {
    if (searchQuery.trim() && searchQuery.length >= minQueryLength) {
      setRecentSearches(prev => {
        const filtered = prev.filter(q => q !== searchQuery);
        return [searchQuery, ...filtered].slice(0, maxRecentSearches);
      });
    }
  }, [minQueryLength, maxRecentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const executeSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    addToRecentSearches(searchQuery);
  }, [addToRecentSearches]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    debouncedQuery,
    recentSearches,
    isSearching,
    setQuery,
    executeSearch,
    clearSearch,
    clearRecentSearches,
    addToRecentSearches
  };
}

// =============================================================================
// CONFLICT DETECTION HOOK
// =============================================================================

interface ConflictItem {
  id: string;
  startTime: Date;
  endTime: Date;
  title?: string;
  type?: string;
}

interface UseConflictDetectionOptions {
  items?: ConflictItem[];
  bufferMinutes?: number;
  onConflictDetected?: (conflicts: ConflictItem[]) => void;
}

export function useConflictDetection({
  items = [],
  bufferMinutes = 15,
  onConflictDetected
}: UseConflictDetectionOptions = {}) {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  
  const detectConflicts = useCallback((newItem: ConflictItem): ConflictItem[] => {
    const buffer = bufferMinutes * 60 * 1000; // Convert to milliseconds
    const newStart = new Date(newItem.startTime.getTime() - buffer);
    const newEnd = new Date(newItem.endTime.getTime() + buffer);
    
    const conflicting = items.filter(item => {
      if (item.id === newItem.id) return false;
      
      const itemStart = new Date(item.startTime);
      const itemEnd = new Date(item.endTime);
      
      // Check for overlap
      return (newStart < itemEnd && newEnd > itemStart);
    });
    
    return conflicting;
  }, [items, bufferMinutes]);
  
  const checkConflicts = useCallback((item: ConflictItem) => {
    const foundConflicts = detectConflicts(item);
    setConflicts(foundConflicts);
    
    if (foundConflicts.length > 0 && onConflictDetected) {
      onConflictDetected(foundConflicts);
    }
    
    return foundConflicts;
  }, [detectConflicts, onConflictDetected]);
  
  const hasConflicts = conflicts.length > 0;
  
  const clearConflicts = useCallback(() => {
    setConflicts([]);
  }, []);
  
  return {
    conflicts,
    hasConflicts,
    checkConflicts,
    clearConflicts,
    detectConflicts
  };
}

// =============================================================================
// FEEDBACK HOOK
// =============================================================================

export function useFeedback() {
  const showSuccess = useCallback((message: string, options?: Partial<FeedbackConfig>) => {
    toast.success(message, {
      duration: options?.duration || UX_CONFIG.FEEDBACK.SUCCESS_DURATION,
      position: options?.position || UX_CONFIG.FEEDBACK.POSITION,
    });
  }, []);

  const showError = useCallback((message: string, options?: Partial<FeedbackConfig>) => {
    toast.error(message, {
      duration: options?.duration || UX_CONFIG.FEEDBACK.ERROR_DURATION,
      position: options?.position || UX_CONFIG.FEEDBACK.POSITION,
    });
  }, []);

  const showWarning = useCallback((message: string, options?: Partial<FeedbackConfig>) => {
    toast.warning(message, {
      duration: options?.duration || UX_CONFIG.FEEDBACK.TOAST_DURATION,
      position: options?.position || UX_CONFIG.FEEDBACK.POSITION,
    });
  }, []);

  const showInfo = useCallback((message: string, options?: Partial<FeedbackConfig>) => {
    toast.info(message, {
      duration: options?.duration || UX_CONFIG.FEEDBACK.TOAST_DURATION,
      position: options?.position || UX_CONFIG.FEEDBACK.POSITION,
    });
  }, []);

  const showCustom = useCallback((config: FeedbackConfig) => {
    const toastFunction = {
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info
    }[config.type];

    toastFunction(config.message, {
      duration: config.duration || UX_CONFIG.FEEDBACK.TOAST_DURATION,
      position: config.position || UX_CONFIG.FEEDBACK.POSITION,
    });
  }, []);

  // Convenience methods with predefined messages
  const success = {
    save: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.SAVE),
    delete: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.DELETE),
    update: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.UPDATE),
    upload: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.UPLOAD),
    export: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.EXPORT),
    import: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.IMPORT),
    emailSent: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.EMAIL_SENT),
    whatsappSent: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.WHATSAPP_SENT),
    leadCreated: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.LEAD_CREATED),
    propertyCreated: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.PROPERTY_CREATED),
    taskCompleted: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.TASK_COMPLETED),
    appointmentBooked: () => showSuccess(FEEDBACK_MESSAGES.SUCCESS.APPOINTMENT_BOOKED),
  };

  const error = {
    generic: () => showError(FEEDBACK_MESSAGES.ERROR.GENERIC),
    network: () => showError(FEEDBACK_MESSAGES.ERROR.NETWORK),
    server: () => showError(FEEDBACK_MESSAGES.ERROR.SERVER),
    validation: () => showError(FEEDBACK_MESSAGES.ERROR.VALIDATION),
    permission: () => showError(FEEDBACK_MESSAGES.ERROR.PERMISSION),
    fileSize: () => showError(FEEDBACK_MESSAGES.ERROR.FILE_SIZE),
    fileType: () => showError(FEEDBACK_MESSAGES.ERROR.FILE_TYPE),
    requiredField: () => showError(FEEDBACK_MESSAGES.ERROR.REQUIRED_FIELD),
    invalidEmail: () => showError(FEEDBACK_MESSAGES.ERROR.INVALID_EMAIL),
    invalidPhone: () => showError(FEEDBACK_MESSAGES.ERROR.INVALID_PHONE),
    duplicateEntry: () => showError(FEEDBACK_MESSAGES.ERROR.DUPLICATE_ENTRY),
    conflict: () => showError(FEEDBACK_MESSAGES.ERROR.CONFLICT),
  };

  const warning = {
    unsavedChanges: () => showWarning(FEEDBACK_MESSAGES.WARNING.UNSAVED_CHANGES),
    deleteConfirm: () => showWarning(FEEDBACK_MESSAGES.WARNING.DELETE_CONFIRM),
    bulkAction: () => showWarning(FEEDBACK_MESSAGES.WARNING.BULK_ACTION),
    offline: () => showWarning(FEEDBACK_MESSAGES.WARNING.OFFLINE),
    sessionExpiring: () => showWarning(FEEDBACK_MESSAGES.WARNING.SESSION_EXPIRING),
    quotaLimit: () => showWarning(FEEDBACK_MESSAGES.WARNING.QUOTA_LIMIT),
  };

  const info = {
    loading: () => showInfo(FEEDBACK_MESSAGES.INFO.LOADING),
    processing: () => showInfo(FEEDBACK_MESSAGES.INFO.PROCESSING),
    syncing: () => showInfo(FEEDBACK_MESSAGES.INFO.SYNCING),
    autoSave: () => showInfo(FEEDBACK_MESSAGES.INFO.AUTO_SAVE),
    newVersion: () => showInfo(FEEDBACK_MESSAGES.INFO.NEW_VERSION),
    maintenance: () => showInfo(FEEDBACK_MESSAGES.INFO.MAINTENANCE),
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom,
    success,
    error,
    warning,
    info
  };
}

// =============================================================================
// DRAG & DROP HOOK
// =============================================================================

interface UseDragDropOptions {
  onDrop?: (files: FileList) => void | Promise<void>;
  onDragStart?: (item: any) => void;
  onDragEnd?: (result: any) => void;
  accept?: string[];
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
}

export function useDragDrop({
  onDrop,
  onDragStart,
  onDragEnd,
  accept = [],
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10
}: UseDragDropOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  
  const validateFiles = useCallback((files: FileList): { valid: FileList; errors: string[] } => {
    const validFiles: File[] = [];
    const fileErrors: string[] = [];
    
    if (!multiple && files.length > 1) {
      fileErrors.push('Apenas um arquivo é permitido');
      return { valid: new DataTransfer().files, errors: fileErrors };
    }
    
    if (files.length > maxFiles) {
      fileErrors.push(`Máximo de ${maxFiles} arquivos permitido`);
      return { valid: new DataTransfer().files, errors: fileErrors };
    }
    
    Array.from(files).forEach((file, index) => {
      // Check file size
      if (file.size > maxSize) {
        fileErrors.push(`${file.name} é muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }
      
      // Check file type
      if (accept.length > 0 && !accept.some(type => file.type.match(type))) {
        fileErrors.push(`${file.name} não é um tipo de arquivo suportado`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Create new FileList with valid files
    const dataTransfer = new DataTransfer();
    validFiles.forEach(file => dataTransfer.items.add(file));
    
    return { valid: dataTransfer.files, errors: fileErrors };
  }, [accept, multiple, maxSize, maxFiles]);
  
  const handleDrop = useCallback(async (files: FileList) => {
    setIsDragging(false);
    setErrors([]);
    
    const { valid, errors: validationErrors } = validateFiles(files);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    if (valid.length > 0 && onDrop) {
      try {
        await onDrop(valid);
      } catch (error) {
        console.error('Drop handler error:', error);
        setErrors(['Erro ao processar arquivos']);
      }
    }
  }, [onDrop, validateFiles]);
  
  const handleDragStart = useCallback((item: any) => {
    setDraggedItem(item);
    setIsDragging(true);
    if (onDragStart) {
      onDragStart(item);
    }
  }, [onDragStart]);
  
  const handleDragEnd = useCallback((result: any) => {
    setDraggedItem(null);
    setIsDragging(false);
    if (onDragEnd) {
      onDragEnd(result);
    }
  }, [onDragEnd]);
  
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);
  
  const dragProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleDrop(files);
      }
    }
  };
  
  return {
    isDragging,
    draggedItem,
    errors,
    handleDrop,
    handleDragStart,
    handleDragEnd,
    clearErrors,
    dragProps,
    validateFiles
  };
}

// =============================================================================
// ASYNC STATE HOOK
// =============================================================================

interface UseAsyncStateOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showFeedback?: boolean;
}

export function useAsyncState<T = any>({
  initialData,
  onSuccess,
  onError,
  showFeedback = false
}: UseAsyncStateOptions<T> = {}) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: undefined,
    success: false
  });
  
  const { showSuccess, showError } = useFeedback();
  
  const execute = useCallback(async (
    asyncFunction: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: undefined, success: false }));
    
    try {
      const result = await asyncFunction();
      setState(prev => ({ ...prev, data: result, loading: false, success: true }));
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (showFeedback && successMessage) {
        showSuccess(successMessage);
      }
      
      return result;
    } catch (error) {
      const err = error as Error;
      setState(prev => ({ ...prev, loading: false, error: err.message, success: false }));
      
      if (onError) {
        onError(err);
      }
      
      if (showFeedback) {
        showError(errorMessage || err.message || 'Ocorreu um erro inesperado');
      }
      
      throw error;
    }
  }, [onSuccess, onError, showFeedback, showSuccess, showError]);
  
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: undefined,
      success: false
    });
  }, [initialData]);
  
  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);
  
  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false, success: false }));
  }, []);
  
  return {
    ...state,
    execute,
    reset,
    setData,
    setError
  };
}

// All hooks are exported individually above