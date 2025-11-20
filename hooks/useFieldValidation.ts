/**
 * Field-Level Validation Hook for Moby CRM
 * 
 * Enhanced validation hook that provides real-time validation with progressive enhancement,
 * visual feedback, and intelligent debouncing for optimal user experience.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { globalValidator, ValidationResult, ValidationRule } from '@/lib/validation/global-validator';
import { UX_CONFIG } from '@/lib/ux-standards';
import { useFeedback } from '@/hooks/useUXPatterns';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface FieldValidationConfig {
  formId: string;
  fieldName: string;
  rules: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceDelay?: number;
  showSuggestions?: boolean;
  formatter?: 'phone' | 'cpf' | 'cnpj' | 'currency';
}

export interface FieldValidationState {
  value: any;
  touched: boolean;
  focused: boolean;
  validating: boolean;
  validated: boolean;
  result?: ValidationResult;
  formatted?: string;
  suggestions?: string[];
}

export interface UseFieldValidationReturn {
  // State
  state: FieldValidationState;
  
  // Validation status
  isValid: boolean;
  isInvalid: boolean;
  hasError: boolean;
  hasWarning: boolean;
  hasInfo: boolean;
  
  // Event handlers
  onChange: (value: any) => void;
  onBlur: () => void;
  onFocus: () => void;
  
  // Manual validation
  validate: () => Promise<ValidationResult>;
  reset: () => void;
  
  // Utilities
  getErrorMessage: () => string | undefined;
  getFormattedValue: () => string;
  getSuggestions: () => string[];
  
  // UI helpers
  getFieldProps: () => {
    value: any;
    onChange: (e: any) => void;
    onBlur: () => void;
    onFocus: () => void;
    'aria-invalid': boolean;
    'aria-describedby': string;
  };
  
  getValidationClasses: () => string;
  getValidationIcon: () => 'check' | 'alert' | 'info' | null;
}

// =============================================================================
// FIELD VALIDATION HOOK
// =============================================================================

export function useFieldValidation(config: FieldValidationConfig): UseFieldValidationReturn {
  const {
    formId,
    fieldName,
    rules,
    validateOnChange = false,
    validateOnBlur = true,
    debounceDelay = UX_CONFIG.VALIDATION.REALTIME_DELAY,
    showSuggestions = true,
    formatter
  } = config;

  // State
  const [state, setState] = useState<FieldValidationState>({
    value: '',
    touched: false,
    focused: false,
    validating: false,
    validated: false
  });
  
  // Refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const validationSequenceRef = useRef(0);
  
  // Register rules with global validator
  useEffect(() => {
    globalValidator.registerForm(formId, { [fieldName]: rules });
  }, [formId, fieldName, rules]);
  
  // Validation function
  const validateField = useCallback(async (): Promise<ValidationResult> => {
    const currentSequence = ++validationSequenceRef.current;
    
    setState(prev => ({ ...prev, validating: true }));
    
    try {
      const result = await globalValidator.validateField(formId, fieldName, state.value);
      
      // Only update if this is the latest validation request
      if (currentSequence === validationSequenceRef.current) {
        setState(prev => ({
          ...prev,
          validating: false,
          validated: true,
          result,
          suggestions: showSuggestions ? result.suggestions : undefined
        }));
      }
      
      return result;
    } catch (error) {
      if (currentSequence === validationSequenceRef.current) {
        const errorResult: ValidationResult = {
          isValid: false,
          message: 'Erro na validação',
          severity: 'error'
        };
        
        setState(prev => ({
          ...prev,
          validating: false,
          validated: true,
          result: errorResult
        }));
        
        return errorResult;
      }
      
      throw error;
    }
  }, [formId, fieldName, state.value, showSuggestions]);
  
  // Debounced validation
  const validateWithDelay = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(validateField, debounceDelay);
  }, [validateField, debounceDelay]);
  
  // Event handlers
  const onChange = useCallback((value: any) => {
    // Format value if formatter is specified
    let formattedValue = value;
    if (formatter && typeof value === 'string') {
      const formatFunction = globalValidator.getFormatter(formatter);
      formattedValue = formatFunction(value);
    }
    
    setState(prev => ({
      ...prev,
      value: formattedValue,
      formatted: formattedValue,
      // Reset validation state on change
      validated: false,
      result: undefined,
      suggestions: undefined
    }));
    
    // Validate on change if enabled and field has been touched
    if (validateOnChange && state.touched) {
      validateWithDelay();
    }
  }, [formatter, validateOnChange, state.touched, validateWithDelay]);
  
  const onBlur = useCallback(() => {
    setState(prev => ({ ...prev, focused: false, touched: true }));
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      validateField();
    }
  }, [validateOnBlur, validateField]);
  
  const onFocus = useCallback(() => {
    setState(prev => ({ ...prev, focused: true }));
  }, []);
  
  // Reset function
  const reset = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    setState({
      value: '',
      touched: false,
      focused: false,
      validating: false,
      validated: false
    });
    
    validationSequenceRef.current = 0;
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  
  // Computed values
  const isValid = state.validated && state.result?.isValid === true;
  const isInvalid = state.validated && state.result?.isValid === false;
  const hasError = isInvalid && state.result?.severity === 'error';
  const hasWarning = isInvalid && state.result?.severity === 'warning';
  const hasInfo = state.result?.severity === 'info';
  
  // Utility functions
  const getErrorMessage = useCallback(() => {
    return state.result?.message;
  }, [state.result]);
  
  const getFormattedValue = useCallback(() => {
    return state.formatted || state.value;
  }, [state.formatted, state.value]);
  
  const getSuggestions = useCallback(() => {
    return state.suggestions || [];
  }, [state.suggestions]);
  
  // UI helpers
  const getFieldProps = useCallback(() => ({
    value: getFormattedValue(),
    onChange: (e: any) => {
      const value = e.target ? e.target.value : e;
      onChange(value);
    },
    onBlur,
    onFocus,
    'aria-invalid': isInvalid,
    'aria-describedby': `${formId}-${fieldName}-validation`
  }), [getFormattedValue, onChange, onBlur, onFocus, isInvalid, formId, fieldName]);
  
  const getValidationClasses = useCallback(() => {
    const classes: string[] = [];
    
    if (state.focused) {
      classes.push('ring-2 ring-blue-500 ring-opacity-20');
    }
    
    if (hasError) {
      classes.push('border-red-500 focus:border-red-500 focus:ring-red-500');
    } else if (hasWarning) {
      classes.push('border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500');
    } else if (isValid && state.touched) {
      classes.push('border-green-500 focus:border-green-500 focus:ring-green-500');
    }
    
    if (state.validating) {
      classes.push('animate-pulse');
    }
    
    return classes.join(' ');
  }, [state.focused, state.touched, state.validating, hasError, hasWarning, isValid]);
  
  const getValidationIcon = useCallback((): 'check' | 'alert' | 'info' | null => {
    if (state.validating) return null;
    
    if (hasError) return 'alert';
    if (hasWarning) return 'alert';
    if (hasInfo) return 'info';
    if (isValid && state.touched) return 'check';
    
    return null;
  }, [state.validating, state.touched, hasError, hasWarning, hasInfo, isValid]);
  
  return {
    // State
    state,
    
    // Validation status
    isValid,
    isInvalid,
    hasError,
    hasWarning,
    hasInfo,
    
    // Event handlers
    onChange,
    onBlur,
    onFocus,
    
    // Manual validation
    validate: validateField,
    reset,
    
    // Utilities
    getErrorMessage,
    getFormattedValue,
    getSuggestions,
    
    // UI helpers
    getFieldProps,
    getValidationClasses,
    getValidationIcon
  };
}

// =============================================================================
// PROGRESSIVE VALIDATION HOOK
// =============================================================================

/**
 * Progressive validation that starts with blur validation and upgrades to real-time
 * validation after the user has interacted with the field.
 */
export function useProgressiveFieldValidation(config: Omit<FieldValidationConfig, 'validateOnChange' | 'validateOnBlur'>) {
  const [validationMode, setValidationMode] = useState<'blur' | 'realtime'>('blur');
  
  const validation = useFieldValidation({
    ...config,
    validateOnChange: validationMode === 'realtime',
    validateOnBlur: true
  });
  
  // Upgrade to real-time validation after first blur validation
  useEffect(() => {
    if (validation.state.validated && validationMode === 'blur') {
      setValidationMode('realtime');
    }
  }, [validation.state.validated, validationMode]);
  
  // Reset validation mode when field is reset
  useEffect(() => {
    if (!validation.state.touched && !validation.state.validated) {
      setValidationMode('blur');
    }
  }, [validation.state.touched, validation.state.validated]);
  
  return {
    ...validation,
    validationMode
  };
}

// =============================================================================
// FORM VALIDATION HOOK
// =============================================================================

export interface UseFormValidationConfig {
  formId: string;
  fields: Record<string, ValidationRule[]>;
  validateOnSubmit?: boolean;
}

export function useFormValidation(config: UseFormValidationConfig) {
  const { formId, fields, validateOnSubmit = true } = config;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Register all fields with global validator
  useEffect(() => {
    globalValidator.registerForm(formId, fields);
  }, [formId, fields]);
  
  // Validate entire form
  const validateForm = useCallback(async (values: Record<string, any>) => {
    return globalValidator.validateForm(formId, values);
  }, [formId]);
  
  // Submit handler with validation
  const handleSubmit = useCallback(async (
    values: Record<string, any>,
    onSubmit: (values: Record<string, any>) => Promise<void> | void
  ) => {
    setSubmitAttempted(true);
    
    if (validateOnSubmit) {
      setIsSubmitting(true);
      
      try {
        const results = await validateForm(values);
        const isValid = globalValidator.isFormValid(results);
        
        if (!isValid) {
          const errors = globalValidator.getErrorMessages(results);
          console.warn('Form validation failed:', errors);
          setIsSubmitting(false);
          return { success: false, errors };
        }
        
        await onSubmit(values);
        setIsSubmitting(false);
        return { success: true };
      } catch (error) {
        setIsSubmitting(false);
        throw error;
      }
    } else {
      try {
        await onSubmit(values);
        return { success: true };
      } catch (error) {
        throw error;
      }
    }
  }, [validateOnSubmit, validateForm]);
  
  // Reset form validation state
  const resetForm = useCallback(() => {
    setIsSubmitting(false);
    setSubmitAttempted(false);
  }, []);
  
  return {
    validateForm,
    handleSubmit,
    resetForm,
    isSubmitting,
    submitAttempted
  };
}