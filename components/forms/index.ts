/**
 * Form Components Index for Moby CRM
 * 
 * Exports all validation-enabled form components and utilities.
 */

// Core validation system - import first to be available for COMMON_FORM_RULES
import { ValidationRules } from '@/lib/validation/global-validator';
export { globalValidator, ValidationRules, CommonValidations } from '@/lib/validation/global-validator';
export type { 
  ValidationRule, 
  ValidationResult, 
  FieldValidation, 
  FormValidation 
} from '@/lib/validation/global-validator';

// Validation hooks
export { 
  useFieldValidation, 
  useProgressiveFieldValidation, 
  useFormValidation 
} from '@/hooks/useFieldValidation';
export type { 
  FieldValidationConfig, 
  FieldValidationState, 
  UseFieldValidationReturn,
  UseFormValidationConfig 
} from '@/hooks/useFieldValidation';

// Core form components
export { ValidatedForm, FormSection, FormField, FormGrid, FormErrorBoundary, useFormContext } from './ValidatedForm';
export type { ValidatedFormProps, FormContextValue, FormSectionProps, FormFieldProps, FormGridProps } from './ValidatedForm';

// Input components
export { 
  ValidatedInput,
  ValidatedEmailInput,
  ValidatedPhoneInput,
  ValidatedPasswordInput,
  ValidatedCurrencyInput
} from './ValidatedInput';
export type { 
  ValidatedInputProps,
  ValidatedEmailInputProps,
  ValidatedPhoneInputProps,
  ValidatedPasswordInputProps,
  ValidatedCurrencyInputProps
} from './ValidatedInput';

// Select components
export { 
  ValidatedSelect,
  ValidatedRequiredSelect,
  BooleanSelect,
  StatusSelect,
  PrioritySelect
} from './ValidatedSelect';
export type { 
  ValidatedSelectProps,
  ValidatedRequiredSelectProps,
  SelectOption,
  SelectOptionGroup
} from './ValidatedSelect';

// Textarea components
export { 
  ValidatedTextarea,
  ValidatedDescriptionTextarea,
  ValidatedCommentTextarea
} from './ValidatedTextarea';
export type { 
  ValidatedTextareaProps,
  ValidatedDescriptionTextareaProps,
  ValidatedCommentTextareaProps
} from './ValidatedTextarea';

// Validation feedback components
export { 
  ValidationFeedback,
  PasswordStrengthIndicator,
  FieldRequirements,
  ValidationSummary
} from './ValidationFeedback';
export type { 
  ValidationFeedbackProps,
  PasswordStrengthProps,
  FieldRequirementsProps,
  ValidationSummaryProps
} from './ValidationFeedback';

// Common validation rules for reuse
export const COMMON_FORM_RULES = {
  // Lead validation rules
  LEAD_NAME: [
    ValidationRules.required('Nome é obrigatório'),
    ValidationRules.minLength(2, 'Nome deve ter pelo menos 2 caracteres')
  ],
  
  LEAD_EMAIL: [
    ValidationRules.email('E-mail inválido')
  ],
  
  LEAD_PHONE: [
    ValidationRules.phone('Telefone inválido')
  ],
  
  // Property validation rules
  PROPERTY_TITLE: [
    ValidationRules.required('Título é obrigatório'),
    ValidationRules.minLength(10, 'Título deve ter pelo menos 10 caracteres'),
    ValidationRules.maxLength(100, 'Título deve ter no máximo 100 caracteres')
  ],
  
  PROPERTY_PRICE: [
    ValidationRules.currency('Valor deve ser um número válido')
  ],
  
  PROPERTY_AREA: [
    ValidationRules.pattern(/^\d+(\.\d{1,2})?$/, 'Área deve ser um número válido')
  ],
  
  // User validation rules
  USER_NAME: [
    ValidationRules.required('Nome é obrigatório'),
    ValidationRules.minLength(2, 'Nome deve ter pelo menos 2 caracteres')
  ],
  
  USER_EMAIL: [
    ValidationRules.required('E-mail é obrigatório'),
    ValidationRules.email('E-mail inválido')
  ],
  
  USER_PASSWORD: [
    ValidationRules.required('Senha é obrigatória'),
    ValidationRules.password('Senha deve ter pelo menos 8 caracteres com letras, números e símbolos')
  ],
  
  // Task validation rules
  TASK_TITLE: [
    ValidationRules.required('Título é obrigatório'),
    ValidationRules.minLength(5, 'Título deve ter pelo menos 5 caracteres')
  ],
  
  TASK_DUE_DATE: [
    ValidationRules.dateRange(new Date(), undefined, 'Data deve ser futura')
  ],
  
  // General validation rules
  REQUIRED_SELECT: [
    ValidationRules.required('Seleção obrigatória')
  ],
  
  OPTIONAL_URL: [
    ValidationRules.url('URL inválida')
  ],
  
  OPTIONAL_CURRENCY: [
    ValidationRules.currency('Valor monetário inválido')
  ]
} as const;