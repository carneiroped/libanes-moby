/**
 * Validated Form Component for Moby CRM
 * 
 * A comprehensive form wrapper that provides consistent validation,
 * error handling, and submission management across the application.
 */

'use client';

import React, { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ValidationSummary } from './ValidationFeedback';
import { useFormValidation } from '@/hooks/useFieldValidation';
import { ValidationRule } from '@/lib/validation/global-validator';
import { cn } from '@/lib/utils';
import { Loader2, Save, X, AlertTriangle } from 'lucide-react';
import { useFeedback } from '@/hooks/useUXPatterns';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ValidatedFormProps {
  // Form identification
  formId: string;
  
  // Validation configuration
  fields: Record<string, ValidationRule[]>;
  validateOnSubmit?: boolean;
  showValidationSummary?: boolean;
  
  // Form data
  initialValues?: Record<string, any>;
  values?: Record<string, any>;
  
  // Event handlers
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  onReset?: () => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string>) => void;
  
  // UI customization
  submitText?: string;
  resetText?: string;
  showResetButton?: boolean;
  showSubmitButton?: boolean;
  submitButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  // Layout
  className?: string;
  actionsClassName?: string;
  summaryClassName?: string;
  
  // Loading states
  isLoading?: boolean;
  loadingText?: string;
  
  // Children
  children: React.ReactNode;
}

export interface FormContextValue {
  formId: string;
  values: Record<string, any>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submitAttempted: boolean;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  clearError: (name: string) => void;
}

// =============================================================================
// FORM CONTEXT
// =============================================================================

const FormContext = React.createContext<FormContextValue | null>(null);

export function useFormContext() {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a ValidatedForm');
  }
  return context;
}

// =============================================================================
// VALIDATED FORM COMPONENT
// =============================================================================

export const ValidatedForm = forwardRef<HTMLFormElement, ValidatedFormProps>(
  ({
    // Form identification
    formId,
    
    // Validation configuration
    fields,
    validateOnSubmit = true,
    showValidationSummary = true,
    
    // Form data
    initialValues = {},
    values: controlledValues,
    
    // Event handlers
    onSubmit,
    onReset,
    onValidationChange,
    
    // UI customization
    submitText = 'Salvar',
    resetText = 'Cancelar',
    showResetButton = true,
    showSubmitButton = true,
    submitButtonVariant = 'default',
    
    // Layout
    className,
    actionsClassName,
    summaryClassName,
    
    // Loading states
    isLoading = false,
    loadingText = 'Salvando...',
    
    // Children
    children,
    
    ...props
  }, ref) => {
    
    // Form state
    const [internalValues, setInternalValues] = useState<Record<string, any>>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [warnings, setWarnings] = useState<Record<string, string>>({});
    
    // Use controlled or internal values
    const formValues = controlledValues || internalValues;
    
    // Form validation hook
    const formValidation = useFormValidation({
      formId,
      fields,
      validateOnSubmit
    });
    
    // Feedback hook
    const { showError, showSuccess } = useFeedback();
    
    // Handle value changes
    const setValue = (name: string, value: any) => {
      if (!controlledValues) {
        setInternalValues(prev => ({ ...prev, [name]: value }));
      }
      
      // Clear error when value changes
      if (errors[name]) {
        clearError(name);
      }
    };
    
    // Handle error setting
    const setError = (name: string, error: string) => {
      setErrors(prev => ({ ...prev, [name]: error }));
    };
    
    // Handle error clearing
    const clearError = (name: string) => {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    };
    
    // Notify parent about validation changes
    React.useEffect(() => {
      const isValid = Object.keys(errors).length === 0;
      if (onValidationChange) {
        onValidationChange(isValid, errors);
      }
    }, [errors, onValidationChange]);
    
    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        const result = await formValidation.handleSubmit(formValues, onSubmit);
        
        if (result?.success === false && result.errors) {
          setErrors(result.errors);
          
          if (showValidationSummary) {
            showError('Corrija os erros destacados e tente novamente');
          }
          return;
        }
        
        // Clear errors on successful submission
        setErrors({});
        showSuccess('Dados salvos com sucesso!');
        
      } catch (error) {
        console.error('Form submission error:', error);
        showError('Erro ao salvar dados. Tente novamente.');
      }
    };
    
    // Handle form reset
    const handleReset = () => {
      if (!controlledValues) {
        setInternalValues(initialValues);
      }
      setErrors({});
      setWarnings({});
      formValidation.resetForm();
      
      if (onReset) {
        onReset();
      }
    };
    
    // Context value
    const contextValue: FormContextValue = {
      formId,
      values: formValues,
      errors,
      isSubmitting: formValidation.isSubmitting || isLoading,
      submitAttempted: formValidation.submitAttempted,
      setValue,
      setError,
      clearError
    };
    
    return (
      <FormContext.Provider value={contextValue}>
        <form
          {...props}
          ref={ref}
          onSubmit={handleSubmit}
          onReset={handleReset}
          className={cn("space-y-6", className)}
          noValidate
        >
          {/* Validation Summary */}
          {showValidationSummary && (Object.keys(errors).length > 0 || Object.keys(warnings).length > 0) && (
            <ValidationSummary
              errors={errors}
              warnings={warnings}
              className={summaryClassName}
            />
          )}
          
          {/* Form Content */}
          <div className="space-y-4">
            {children}
          </div>
          
          {/* Form Actions */}
          {(showSubmitButton || showResetButton) && (
            <div className={cn(
              "flex items-center justify-end gap-3 pt-6 border-t",
              actionsClassName
            )}>
              {showResetButton && (
                <Button
                  type="reset"
                  variant="outline"
                  disabled={formValidation.isSubmitting || isLoading}
                  onClick={handleReset}
                >
                  <X className="h-4 w-4 mr-2" />
                  {resetText}
                </Button>
              )}
              
              {showSubmitButton && (
                <Button
                  type="submit"
                  variant={submitButtonVariant}
                  disabled={formValidation.isSubmitting || isLoading}
                >
                  {formValidation.isSubmitting || isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {loadingText}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {submitText}
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </form>
      </FormContext.Provider>
    );
  }
);

ValidatedForm.displayName = 'ValidatedForm';

// =============================================================================
// FORM SECTION COMPONENT
// =============================================================================

export interface FormSectionProps {
  title?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormSection({
  title,
  description,
  required = false,
  className,
  children
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className={cn(
              "text-lg font-medium",
              required && "after:content-['*'] after:ml-1 after:text-red-500"
            )}>
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// FORM FIELD COMPONENT
// =============================================================================

export interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

// =============================================================================
// FORM GRID COMPONENT
// =============================================================================

export interface FormGridProps {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 2 | 3 | 4 | 6 | 8;
  className?: string;
  children: React.ReactNode;
}

export function FormGrid({
  columns = 2,
  gap = 4,
  className,
  children
}: FormGridProps) {
  const getGridClasses = () => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6'
    };
    
    const gapClasses = {
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8'
    };
    
    return `grid ${columnClasses[columns]} ${gapClasses[gap]}`;
  };
  
  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
}

// =============================================================================
// FORM ERROR BOUNDARY
// =============================================================================

interface FormErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class FormErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  FormErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): FormErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Form error boundary caught an error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="font-medium text-red-800">Erro no Formulário</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">
            Ocorreu um erro inesperado no formulário. Tente recarregar a página.
          </p>
        </div>
      );
    }
    
    return this.props.children;
  }
}