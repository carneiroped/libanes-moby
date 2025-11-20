/**
 * Validated Textarea Component for Moby CRM
 * 
 * A comprehensive textarea component with built-in validation,
 * character counting, auto-resize, and accessibility features.
 */

'use client';

import React, { forwardRef, useState, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Maximize2,
  Minimize2
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

export interface ValidatedTextareaProps {
  // Basic textarea props
  id: string;
  name: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;

  // Textarea-specific props
  rows?: number;
  cols?: number;
  minLength?: number;
  maxLength?: number;
  
  // Label and help
  label?: string;
  required?: boolean;
  helpText?: string;
  
  // Validation
  formId: string;
  rules: ValidationRule[];
  
  // Features
  autoResize?: boolean;
  showCharacterCount?: boolean;
  showValidationIcon?: boolean;
  showHelpIcon?: boolean;
  allowExpand?: boolean;
  
  // Event handlers
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  
  // Custom styling
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

// =============================================================================
// VALIDATED TEXTAREA COMPONENT
// =============================================================================

export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({
    // Basic props
    id,
    name,
    value,
    defaultValue,
    placeholder,
    disabled = false,
    readOnly = false,
    className,
    
    // Textarea-specific props
    rows = 4,
    cols,
    minLength,
    maxLength,
    
    // Label and help
    label,
    required = false,
    helpText,
    
    // Validation
    formId,
    rules,
    
    // Features
    autoResize = false,
    showCharacterCount = false,
    showValidationIcon = true,
    showHelpIcon = true,
    allowExpand = false,
    
    // Event handlers
    onChange,
    onBlur,
    onFocus,
    onValidationChange,
    
    // Custom styling
    size = 'md',
    variant = 'default',
    
    ...props
  }, ref) => {
    
    // Component state
    const [isExpanded, setIsExpanded] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // Merge refs
    const mergedRef = useCallback((node: HTMLTextAreaElement) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);
    
    // Field validation
    const validation = useProgressiveFieldValidation({
      formId,
      fieldName: name,
      rules,
      showSuggestions: false
    });
    
    // Update external validation state
    React.useEffect(() => {
      if (onValidationChange) {
        onValidationChange(validation.isValid, validation.getErrorMessage());
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validation.isValid, validation.getErrorMessage, onValidationChange]);
    
    // Auto-resize functionality
    const autoResizeTextarea = useCallback(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [autoResize]);
    
    // Handle value changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      
      validation.onChange(newValue);
      
      if (onChange) {
        onChange(newValue);
      }
      
      // Auto-resize after value change
      if (autoResize) {
        setTimeout(autoResizeTextarea, 0);
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
    
    // Auto-resize on mount and value changes
    React.useEffect(() => {
      if (autoResize) {
        autoResizeTextarea();
      }
    }, [autoResize, autoResizeTextarea, validation.state.value]);
    
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
    
    // Get expand/collapse button
    const ExpandButton = () => {
      if (!allowExpand) return null;
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isExpanded ? 'Minimizar' : 'Expandir'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    };
    
    // Get character count
    const getCharacterCount = () => {
      const currentLength = validation.getFormattedValue()?.length || 0;
      
      if (maxLength) {
        const remaining = maxLength - currentLength;
        const isNearLimit = remaining <= (maxLength * 0.1); // 10% of max length
        const isOverLimit = remaining < 0;
        
        return {
          current: currentLength,
          max: maxLength,
          remaining,
          isNearLimit,
          isOverLimit
        };
      }
      
      return {
        current: currentLength,
        max: undefined,
        remaining: undefined,
        isNearLimit: false,
        isOverLimit: false
      };
    };
    
    // Get size classes
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'text-sm px-3 py-2';
        case 'lg':
          return 'text-lg px-4 py-3';
        default:
          return 'px-3 py-2';
      }
    };
    
    // Get current value
    const currentValue = value || validation.getFormattedValue() || defaultValue || '';
    
    // Get character count info
    const characterCount = getCharacterCount();
    
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
        
        {/* Textarea Container */}
        <div className="relative">
          <Textarea
            {...props}
            ref={mergedRef}
            id={id}
            name={name}
            value={currentValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            rows={isExpanded ? Math.max(rows * 2, 8) : rows}
            cols={cols}
            minLength={minLength}
            maxLength={maxLength}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            aria-invalid={validation.isInvalid}
            aria-describedby={`${id}-validation ${id}-help ${id}-count`}
            className={cn(
              getSizeClasses(),
              validation.getValidationClasses(),
              // Add padding for icons
              (showValidationIcon || allowExpand) && "pr-10",
              autoResize && "resize-none",
              className
            )}
            style={{
              minHeight: autoResize ? 'auto' : undefined,
              ...props.style
            }}
          />
          
          {/* Icons Container */}
          {(showValidationIcon || allowExpand) && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <ValidationIcon />
              <ExpandButton />
            </div>
          )}
        </div>
        
        {/* Character Count */}
        {showCharacterCount && (
          <div 
            id={`${id}-count`}
            className="flex justify-end"
          >
            <span className={cn(
              "text-xs",
              characterCount.isOverLimit && "text-red-500 font-medium",
              characterCount.isNearLimit && !characterCount.isOverLimit && "text-yellow-600",
              !characterCount.isNearLimit && "text-muted-foreground"
            )}>
              {characterCount.current}
              {characterCount.max && ` / ${characterCount.max}`}
              {characterCount.remaining !== undefined && characterCount.remaining < 0 && 
                ` (${Math.abs(characterCount.remaining)} a mais)`
              }
            </span>
          </div>
        )}
        
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

ValidatedTextarea.displayName = 'ValidatedTextarea';

// =============================================================================
// SPECIALIZED TEXTAREA COMPONENTS
// =============================================================================

export interface ValidatedDescriptionTextareaProps extends Omit<ValidatedTextareaProps, 'rules'> {
  minWords?: number;
  maxWords?: number;
}

export const ValidatedDescriptionTextarea = forwardRef<HTMLTextAreaElement, ValidatedDescriptionTextareaProps>(
  ({ minWords = 10, maxWords = 500, maxLength = 2000, ...props }, ref) => {
    const rules: ValidationRule[] = [];
    
    if (props.required) {
      rules.push({ type: 'required', message: 'Descrição é obrigatória' });
    }
    
    if (minWords) {
      rules.push({
        type: 'custom',
        message: `Descrição deve ter pelo menos ${minWords} palavras`,
        validator: (value) => {
          if (!value) return !props.required;
          const wordCount = value.trim().split(/\s+/).length;
          return wordCount >= minWords;
        }
      });
    }
    
    if (maxWords) {
      rules.push({
        type: 'custom',
        message: `Descrição deve ter no máximo ${maxWords} palavras`,
        validator: (value) => {
          if (!value) return true;
          const wordCount = value.trim().split(/\s+/).length;
          return wordCount <= maxWords;
        }
      });
    }
    
    return (
      <ValidatedTextarea
        {...props}
        ref={ref}
        rules={rules}
        maxLength={maxLength}
        showCharacterCount={true}
        autoResize={true}
        allowExpand={true}
        helpText={props.helpText || `Entre ${minWords} e ${maxWords} palavras`}
      />
    );
  }
);

ValidatedDescriptionTextarea.displayName = 'ValidatedDescriptionTextarea';

export interface ValidatedCommentTextareaProps extends Omit<ValidatedTextareaProps, 'rules'> {}

export const ValidatedCommentTextarea = forwardRef<HTMLTextAreaElement, ValidatedCommentTextareaProps>(
  (props, ref) => {
    const rules: ValidationRule[] = [];
    
    if (props.required) {
      rules.push({ type: 'required', message: 'Comentário é obrigatório' });
    }
    
    return (
      <ValidatedTextarea
        {...props}
        ref={ref}
        rules={rules}
        rows={3}
        maxLength={1000}
        showCharacterCount={true}
        autoResize={true}
        placeholder={props.placeholder || "Digite seu comentário..."}
      />
    );
  }
);

ValidatedCommentTextarea.displayName = 'ValidatedCommentTextarea';