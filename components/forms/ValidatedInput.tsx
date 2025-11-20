/**
 * Validated Input Component for Moby CRM
 * 
 * A comprehensive input component with built-in real-time validation,
 * visual feedback, suggestions, and accessibility features.
 */

'use client';

import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ValidationFeedback } from './ValidationFeedback';
import { useProgressiveFieldValidation } from '@/hooks/useFieldValidation';
import { ValidationRule } from '@/lib/validation/global-validator';
import { cn } from '@/lib/utils';
import { 
  Check, 
  AlertCircle, 
  Info, 
  Loader2, 
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ValidatedInputProps {
  // Basic input props
  id: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  
  // Label and help
  label?: string;
  required?: boolean;
  helpText?: string;
  
  // Validation
  formId: string;
  rules: ValidationRule[];
  formatter?: 'phone' | 'cpf' | 'cnpj' | 'currency';
  
  // Visual options
  showValidationIcon?: boolean;
  showSuggestions?: boolean;
  showHelpIcon?: boolean;
  showPasswordToggle?: boolean;
  
  // Event handlers
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  
  // Custom styling
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

// =============================================================================
// VALIDATED INPUT COMPONENT
// =============================================================================

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({
    // Basic props
    id,
    name,
    type = 'text',
    value,
    defaultValue,
    placeholder,
    disabled = false,
    readOnly = false,
    className,
    
    // Label and help
    label,
    required = false,
    helpText,
    
    // Validation
    formId,
    rules,
    formatter,
    
    // Visual options
    showValidationIcon = true,
    showSuggestions = true,
    showHelpIcon = true,
    showPasswordToggle = false,
    
    // Event handlers
    onChange,
    onBlur,
    onFocus,
    onValidationChange,
    
    // Custom styling
    variant = 'default',
    size = 'md',
    
    ...props
  }, ref) => {
    
    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);
    
    // Field validation
    const validation = useProgressiveFieldValidation({
      formId,
      fieldName: name,
      rules,
      formatter,
      showSuggestions
    });
    
    // Update external validation state
    React.useEffect(() => {
      if (onValidationChange) {
        onValidationChange(validation.isValid, validation.getErrorMessage());
      }
    }, [validation, validation.isValid, validation.getErrorMessage, onValidationChange]);
    
    // Handle value changes
    const handleChange = (value: string) => {
      validation.onChange(value);
      if (onChange) {
        onChange(value);
      }
    };
    
    // Handle blur
    const handleBlur = () => {
      validation.onBlur();
      if (onBlur) {
        onBlur();
      }
    };
    
    // Handle focus
    const handleFocus = () => {
      validation.onFocus();
      if (onFocus) {
        onFocus();
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
    
    // Get password toggle
    const PasswordToggle = () => {
      if (!showPasswordToggle || type !== 'password') return null;
      
      return (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      );
    };
    
    // Determine input type (handle password visibility)
    const inputType = type === 'password' && showPassword ? 'text' : type;
    
    // Get size classes
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'h-8 px-3 text-sm';
        case 'lg':
          return 'h-12 px-4 text-lg';
        default:
          return 'h-10 px-3';
      }
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
        
        {/* Input Container */}
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            id={id}
            name={name}
            type={inputType}
            value={validation.getFormattedValue()}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            aria-invalid={validation.isInvalid}
            aria-describedby={`${id}-validation ${id}-help`}
            className={cn(
              getSizeClasses(),
              validation.getValidationClasses(),
              // Add padding for icons
              (showValidationIcon || showPasswordToggle) && "pr-10",
              className
            )}
          />
          
          {/* Icons Container */}
          {(showValidationIcon || showPasswordToggle) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
              <ValidationIcon />
              <PasswordToggle />
            </div>
          )}
        </div>
        
        {/* Validation Feedback */}
        <ValidationFeedback
          id={`${id}-validation`}
          isValid={validation.isValid}
          isInvalid={validation.isInvalid}
          message={validation.getErrorMessage()}
          suggestions={validation.getSuggestions()}
          showSuggestions={showSuggestions}
          severity={validation.state.result?.severity}
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

ValidatedInput.displayName = 'ValidatedInput';

// =============================================================================
// SPECIALIZED INPUT COMPONENTS
// =============================================================================

export interface ValidatedEmailInputProps extends Omit<ValidatedInputProps, 'type' | 'rules'> {
  checkDomain?: boolean;
}

export const ValidatedEmailInput = forwardRef<HTMLInputElement, ValidatedEmailInputProps>(
  ({ checkDomain = true, ...props }, ref) => {
    const rules: ValidationRule[] = [
      { type: 'email', message: 'E-mail inválido' }
    ];
    
    if (props.required) {
      rules.unshift({ type: 'required', message: 'E-mail é obrigatório' });
    }
    
    return (
      <ValidatedInput
        {...props}
        ref={ref}
        type="email"
        rules={rules}
        showSuggestions={checkDomain}
      />
    );
  }
);

ValidatedEmailInput.displayName = 'ValidatedEmailInput';

export interface ValidatedPhoneInputProps extends Omit<ValidatedInputProps, 'type' | 'rules' | 'formatter'> {}

export const ValidatedPhoneInput = forwardRef<HTMLInputElement, ValidatedPhoneInputProps>(
  (props, ref) => {
    const rules: ValidationRule[] = [
      { type: 'phone', message: 'Telefone inválido' }
    ];
    
    if (props.required) {
      rules.unshift({ type: 'required', message: 'Telefone é obrigatório' });
    }
    
    return (
      <ValidatedInput
        {...props}
        ref={ref}
        type="tel"
        rules={rules}
        formatter="phone"
        placeholder={props.placeholder || "(11) 99999-9999"}
      />
    );
  }
);

ValidatedPhoneInput.displayName = 'ValidatedPhoneInput';

export interface ValidatedPasswordInputProps extends Omit<ValidatedInputProps, 'type' | 'rules'> {
  showStrengthMeter?: boolean;
  minStrength?: 'weak' | 'medium' | 'strong' | 'very-strong';
}

export const ValidatedPasswordInput = forwardRef<HTMLInputElement, ValidatedPasswordInputProps>(
  ({ showStrengthMeter = true, minStrength = 'strong', ...props }, ref) => {
    const rules: ValidationRule[] = [
      { type: 'password', message: 'Senha deve ter pelo menos 8 caracteres com letras, números e símbolos' }
    ];
    
    if (props.required) {
      rules.unshift({ type: 'required', message: 'Senha é obrigatória' });
    }
    
    return (
      <ValidatedInput
        {...props}
        ref={ref}
        type="password"
        rules={rules}
        showPasswordToggle={true}
        helpText={props.helpText || "Mínimo 8 caracteres com letras maiúsculas, minúsculas, números e símbolos"}
      />
    );
  }
);

ValidatedPasswordInput.displayName = 'ValidatedPasswordInput';

export interface ValidatedCurrencyInputProps extends Omit<ValidatedInputProps, 'type' | 'rules' | 'formatter'> {}

export const ValidatedCurrencyInput = forwardRef<HTMLInputElement, ValidatedCurrencyInputProps>(
  (props, ref) => {
    const rules: ValidationRule[] = [
      { type: 'currency', message: 'Valor monetário inválido' }
    ];
    
    if (props.required) {
      rules.unshift({ type: 'required', message: 'Valor é obrigatório' });
    }
    
    return (
      <ValidatedInput
        {...props}
        ref={ref}
        type="text"
        rules={rules}
        formatter="currency"
        placeholder={props.placeholder || "R$ 0,00"}
      />
    );
  }
);

ValidatedCurrencyInput.displayName = 'ValidatedCurrencyInput';