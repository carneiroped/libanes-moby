/**
 * Validated Select Component for Moby CRM
 * 
 * A comprehensive select component with built-in validation,
 * real-time feedback, and consistent styling.
 */

'use client';

import React, { forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { ValidationFeedback } from './ValidationFeedback';
import { useProgressiveFieldValidation } from '@/hooks/useFieldValidation';
import { ValidationRule } from '@/lib/validation/global-validator';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Check, 
  AlertCircle, 
  Info, 
  Loader2, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface ValidatedSelectProps {
  // Basic select props
  id: string;
  name: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  
  // Options
  options: SelectOption[] | SelectOptionGroup[];
  
  // Label and help
  label?: string;
  required?: boolean;
  helpText?: string;
  
  // Validation
  formId: string;
  rules: ValidationRule[];
  
  // Visual options
  showValidationIcon?: boolean;
  showHelpIcon?: boolean;
  
  // Event handlers
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  
  // Custom styling
  size?: 'sm' | 'md' | 'lg';
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function isOptionGroup(item: SelectOption | SelectOptionGroup): item is SelectOptionGroup {
  return 'options' in item;
}

function flattenOptions(options: (SelectOption | SelectOptionGroup)[]): SelectOption[] {
  const flattened: SelectOption[] = [];
  
  options.forEach(item => {
    if (isOptionGroup(item)) {
      flattened.push(...item.options);
    } else {
      flattened.push(item);
    }
  });
  
  return flattened;
}

// =============================================================================
// VALIDATED SELECT COMPONENT
// =============================================================================

export const ValidatedSelect = forwardRef<HTMLButtonElement, ValidatedSelectProps>(
  ({
    // Basic props
    id,
    name,
    value,
    defaultValue,
    placeholder = "Selecione uma opção...",
    disabled = false,
    className,
    
    // Options
    options,
    
    // Label and help
    label,
    required = false,
    helpText,
    
    // Validation
    formId,
    rules,
    
    // Visual options
    showValidationIcon = true,
    showHelpIcon = true,
    
    // Event handlers
    onValueChange,
    onOpenChange,
    onValidationChange,
    
    // Custom styling
    size = 'md',
    
    ...props
  }, ref) => {
    
    // Field validation
    const validation = useProgressiveFieldValidation({
      formId,
      fieldName: name,
      rules,
      showSuggestions: false // Selects don't typically need suggestions
    });
    
    // Update external validation state
    React.useEffect(() => {
      if (onValidationChange) {
        onValidationChange(validation.isValid, validation.getErrorMessage());
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validation.isValid, validation.getErrorMessage, onValidationChange]);
    
    // Handle value changes
    const handleValueChange = (newValue: string) => {
      validation.onChange(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };
    
    // Handle open state changes
    const handleOpenChange = (open: boolean) => {
      if (!open) {
        // Treat closing as blur
        validation.onBlur();
      } else {
        validation.onFocus();
      }
      
      if (onOpenChange) {
        onOpenChange(open);
      }
    };
    
    // Get validation icon
    const ValidationIcon = () => {
      if (!showValidationIcon) return null;
      
      if (validation.state.validating) {
        return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
      }
      
      const icon = validation.getValidationIcon();
      
      switch (icon) {
        case 'check':
          return <Check className="h-4 w-4 text-green-500" />;
        case 'alert':
          return <AlertCircle className="h-4 w-4 text-red-500" />;
        case 'info':
          return <Info className="h-4 w-4 text-blue-500" />;
        default:
          return null;
      }
    };
    
    // Get help icon
    const HelpIcon = () => {
      if (!showHelpIcon || !helpText) return null;
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs text-sm">{helpText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    };
    
    // Get size classes
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'h-8 text-sm';
        case 'lg':
          return 'h-12 text-lg';
        default:
          return 'h-10';
      }
    };
    
    // Get current value for display
    const currentValue = value || validation.getFormattedValue() || defaultValue;
    
    // Find selected option for display
    const flatOptions = flattenOptions(options);
    const selectedOption = flatOptions.find(opt => opt.value === currentValue);
    
    // Render select content
    const renderSelectContent = () => {
      return options.map((item, index) => {
        if (isOptionGroup(item)) {
          // Render option group
          return (
            <div key={index}>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                {item.label}
              </div>
              {item.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="pl-6"
                >
                  {option.label}
                </SelectItem>
              ))}
            </div>
          );
        } else {
          // Render individual option
          return (
            <SelectItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
            >
              {item.label}
            </SelectItem>
          );
        }
      });
    };
    
    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <div className="flex items-center gap-2">
            <Label 
              htmlFor={id}
              className={cn(
                "text-sm font-medium",
                required && "after:content-['*'] after:ml-0.5 after:text-red-500"
              )}
            >
              {label}
            </Label>
            <HelpIcon />
          </div>
        )}
        
        {/* Select Container */}
        <div className="relative">
          <Select
            value={currentValue}
            onValueChange={handleValueChange}
            onOpenChange={handleOpenChange}
            disabled={disabled}
          >
            <SelectTrigger
              ref={ref}
              id={id}
              aria-invalid={validation.isInvalid}
              aria-describedby={`${id}-validation ${id}-help`}
              className={cn(
                getSizeClasses(),
                validation.getValidationClasses(),
                // Add padding for validation icon
                showValidationIcon && "pr-12",
                className
              )}
            >
              <SelectValue placeholder={placeholder}>
                {selectedOption?.label || placeholder}
              </SelectValue>
            </SelectTrigger>
            
            <SelectContent>
              {renderSelectContent()}
            </SelectContent>
          </Select>
          
          {/* Validation Icon */}
          {showValidationIcon && (
            <div className="absolute inset-y-0 right-8 flex items-center pr-1">
              <ValidationIcon />
            </div>
          )}
        </div>
        
        {/* Validation Feedback */}
        <ValidationFeedback
          id={`${id}-validation`}
          isValid={validation.isValid}
          isInvalid={validation.isInvalid}
          message={validation.getErrorMessage()}
          severity={validation.state.result?.severity}
          showSuggestions={false}
        />
        
        {/* Help Text */}
        {helpText && !validation.isInvalid && (
          <p id={`${id}-help`} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

ValidatedSelect.displayName = 'ValidatedSelect';

// =============================================================================
// SPECIALIZED SELECT COMPONENTS
// =============================================================================

export interface ValidatedRequiredSelectProps extends Omit<ValidatedSelectProps, 'rules'> {}

export const ValidatedRequiredSelect = forwardRef<HTMLButtonElement, ValidatedRequiredSelectProps>(
  (props, ref) => {
    const rules: ValidationRule[] = [
      { type: 'required', message: `${props.label || 'Campo'} é obrigatório` }
    ];
    
    return (
      <ValidatedSelect
        {...props}
        ref={ref}
        rules={rules}
        required={true}
      />
    );
  }
);

ValidatedRequiredSelect.displayName = 'ValidatedRequiredSelect';

// =============================================================================
// COMMON SELECT PRESETS
// =============================================================================

export const BooleanSelect = forwardRef<HTMLButtonElement, Omit<ValidatedSelectProps, 'options'>>(
  (props, ref) => {
    const options: SelectOption[] = [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' }
    ];
    
    return (
      <ValidatedSelect
        {...props}
        ref={ref}
        options={options}
      />
    );
  }
);

BooleanSelect.displayName = 'BooleanSelect';

export const StatusSelect = forwardRef<HTMLButtonElement, Omit<ValidatedSelectProps, 'options'>>(
  (props, ref) => {
    const options: SelectOption[] = [
      { value: 'active', label: 'Ativo' },
      { value: 'inactive', label: 'Inativo' },
      { value: 'pending', label: 'Pendente' },
      { value: 'archived', label: 'Arquivado' }
    ];
    
    return (
      <ValidatedSelect
        {...props}
        ref={ref}
        options={options}
      />
    );
  }
);

StatusSelect.displayName = 'StatusSelect';

export const PrioritySelect = forwardRef<HTMLButtonElement, Omit<ValidatedSelectProps, 'options'>>(
  (props, ref) => {
    const options: SelectOption[] = [
      { value: 'low', label: 'Baixa' },
      { value: 'medium', label: 'Média' },
      { value: 'high', label: 'Alta' },
      { value: 'urgent', label: 'Urgente' }
    ];
    
    return (
      <ValidatedSelect
        {...props}
        ref={ref}
        options={options}
      />
    );
  }
);

PrioritySelect.displayName = 'PrioritySelect';