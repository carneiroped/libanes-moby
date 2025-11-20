/**
 * Validation Feedback Component for Moby CRM
 * 
 * Provides consistent visual feedback for form validation including
 * error messages, warnings, suggestions, and accessibility features.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ValidationFeedbackProps {
  id?: string;
  isValid?: boolean;
  isInvalid?: boolean;
  message?: string;
  suggestions?: string[];
  severity?: 'error' | 'warning' | 'info' | 'success';
  showSuggestions?: boolean;
  className?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

// =============================================================================
// VALIDATION FEEDBACK COMPONENT
// =============================================================================

export function ValidationFeedback({
  id,
  isValid = false,
  isInvalid = false,
  message,
  suggestions = [],
  severity = 'error',
  showSuggestions = true,
  className,
  onSuggestionClick
}: ValidationFeedbackProps) {
  
  // Don't render if no validation state or message
  if (!isValid && !isInvalid && !message) {
    return null;
  }
  
  // Determine severity from validation state if not explicitly provided
  let finalSeverity = severity;
  if (isValid) {
    finalSeverity = 'success';
  } else if (isInvalid && !severity) {
    finalSeverity = 'error';
  }
  
  // Get icon based on severity
  const getIcon = () => {
    switch (finalSeverity) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  // Get message color classes
  const getMessageClasses = () => {
    switch (finalSeverity) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  // Get suggestion badge variant
  const getSuggestionVariant = () => {
    switch (finalSeverity) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'secondary' as const;
      case 'info':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };
  
  return (
    <div 
      id={id}
      className={cn("space-y-2", className)}
      role={finalSeverity === 'error' ? 'alert' : 'status'}
      aria-live={finalSeverity === 'error' ? 'assertive' : 'polite'}
    >
      {/* Main Message */}
      {message && (
        <div className="flex items-start gap-2">
          {getIcon()}
          <p className={cn("text-sm", getMessageClasses())}>
            {message}
          </p>
        </div>
      )}
      
      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lightbulb className="h-3 w-3" />
            <span>Sugestões:</span>
          </div>
          
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2">
                <ArrowRight className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                
                {onSuggestionClick ? (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-left justify-start"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {suggestion}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PASSWORD STRENGTH INDICATOR
// =============================================================================

export interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthProps) {
  // Calculate password strength
  const calculateStrength = () => {
    if (!password) return { strength: 0, level: 'none' as const, requirements: [] };
    
    const requirements = [
      { met: password.length >= 8, text: 'Mínimo 8 caracteres' },
      { met: /[a-z]/.test(password), text: 'Uma letra minúscula' },
      { met: /[A-Z]/.test(password), text: 'Uma letra maiúscula' },
      { met: /\d/.test(password), text: 'Um número' },
      { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), text: 'Um caractere especial' },
    ];
    
    const metRequirements = requirements.filter(req => req.met).length;
    let level: 'none' | 'weak' | 'medium' | 'strong' | 'very-strong';
    
    if (metRequirements === 0) level = 'none';
    else if (metRequirements <= 2) level = 'weak';
    else if (metRequirements === 3) level = 'medium';
    else if (metRequirements === 4) level = 'strong';
    else level = 'very-strong';
    
    return {
      strength: (metRequirements / 5) * 100,
      level,
      requirements
    };
  };
  
  const { strength, level, requirements } = calculateStrength();
  
  // Get color classes based on strength
  const getStrengthColor = () => {
    switch (level) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-blue-500';
      case 'very-strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  // Get strength label
  const getStrengthLabel = () => {
    switch (level) {
      case 'weak':
        return 'Fraca';
      case 'medium':
        return 'Média';
      case 'strong':
        return 'Forte';
      case 'very-strong':
        return 'Muito Forte';
      default:
        return '';
    }
  };
  
  if (!password) return null;
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Força da senha:</span>
          <span className={cn(
            "font-medium",
            level === 'weak' && "text-red-600",
            level === 'medium' && "text-yellow-600",
            level === 'strong' && "text-blue-600",
            level === 'very-strong' && "text-green-600"
          )}>
            {getStrengthLabel()}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all duration-300", getStrengthColor())}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>
      
      {/* Requirements List */}
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Requisitos:</span>
        <div className="grid grid-cols-1 gap-1">
          {requirements.map((requirement, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              {requirement.met ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <div className="h-3 w-3 rounded-full border border-gray-300" />
              )}
              <span className={cn(
                requirement.met ? "text-green-600" : "text-muted-foreground"
              )}>
                {requirement.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FIELD REQUIREMENTS HELPER
// =============================================================================

export interface FieldRequirementsProps {
  requirements: Array<{
    text: string;
    met: boolean;
    severity?: 'required' | 'recommended' | 'optional';
  }>;
  className?: string;
}

export function FieldRequirements({ requirements, className }: FieldRequirementsProps) {
  if (!requirements.length) return null;
  
  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-xs text-muted-foreground">Requisitos:</span>
      <div className="space-y-1">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {requirement.met ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <div className={cn(
                "h-3 w-3 rounded-full border",
                requirement.severity === 'required' && "border-red-300",
                requirement.severity === 'recommended' && "border-yellow-300",
                !requirement.severity && "border-gray-300"
              )} />
            )}
            <span className={cn(
              requirement.met && "text-green-600",
              !requirement.met && requirement.severity === 'required' && "text-red-600",
              !requirement.met && requirement.severity === 'recommended' && "text-yellow-600",
              !requirement.met && !requirement.severity && "text-muted-foreground"
            )}>
              {requirement.text}
              {requirement.severity === 'required' && !requirement.met && ' *'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// VALIDATION SUMMARY
// =============================================================================

export interface ValidationSummaryProps {
  errors: Record<string, string>;
  warnings?: Record<string, string>;
  className?: string;
  title?: string;
}

export function ValidationSummary({ 
  errors, 
  warnings = {}, 
  className,
  title = "Erros de validação"
}: ValidationSummaryProps) {
  const errorCount = Object.keys(errors).length;
  const warningCount = Object.keys(warnings).length;
  
  if (errorCount === 0 && warningCount === 0) return null;
  
  return (
    <div className={cn(
      "rounded-lg border p-4 space-y-3",
      errorCount > 0 && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
      errorCount === 0 && warningCount > 0 && "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
      className
    )}>
      <div className="flex items-center gap-2">
        {errorCount > 0 ? (
          <AlertCircle className="h-5 w-5 text-red-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-yellow-500" />
        )}
        <h3 className="font-medium text-sm">
          {title} ({errorCount + warningCount})
        </h3>
      </div>
      
      {/* Errors */}
      {errorCount > 0 && (
        <div className="space-y-2">
          {Object.entries(errors).map(([field, message]) => (
            <div key={field} className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
              <div>
                <span className="font-medium capitalize">{field.replace('_', ' ')}: </span>
                <span className="text-red-700 dark:text-red-300">{message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Warnings */}
      {warningCount > 0 && (
        <div className="space-y-2">
          {Object.entries(warnings).map(([field, message]) => (
            <div key={field} className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
              <div>
                <span className="font-medium capitalize">{field.replace('_', ' ')}: </span>
                <span className="text-yellow-700 dark:text-yellow-300">{message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}