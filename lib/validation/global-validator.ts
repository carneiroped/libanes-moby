/**
 * Global Validation System for Moby CRM
 * 
 * Comprehensive validation rules and utilities for consistent form validation
 * across the entire application with real-time feedback and progressive validation.
 */

import { VALIDATION_RULES, UX_CONFIG } from '@/lib/ux-standards';

// =============================================================================
// VALIDATION RULE TYPES
// =============================================================================

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'cpf' | 'cnpj' | 'url' | 'min' | 'max' | 'pattern' | 'custom' | 'currency' | 'date' | 'password';
  message: string;
  value?: any;
  validator?: (value: any) => boolean | Promise<boolean>;
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
  suggestions?: string[];
}

export interface FieldValidation {
  rules: ValidationRule[];
  touched: boolean;
  validated: boolean;
  result?: ValidationResult;
}

export interface FormValidation {
  [fieldName: string]: FieldValidation;
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Format phone number with Brazilian format
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Format CPF with Brazilian format
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Format CNPJ with Brazilian format
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Format currency with Brazilian format
 */
export function formatCurrency(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const numberValue = parseFloat(cleaned) / 100;
  
  if (isNaN(numberValue)) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(numberValue);
}

/**
 * Format currency input (removes currency symbols, keeps numbers and decimal)
 */
export function formatCurrencyInput(value: string): string {
  return value.replace(/[^\d,]/g, '').replace(',', '.');
}

/**
 * Validate CPF using Brazilian algorithm
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  return remainder === parseInt(cleaned.charAt(10));
}

/**
 * Validate CNPJ using Brazilian algorithm
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights1[i];
  }
  
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (digit1 !== parseInt(cleaned.charAt(12))) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights2[i];
  }
  
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return digit2 === parseInt(cleaned.charAt(13));
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  requirements: Array<{ met: boolean; text: string; }>;
} {
  const requirements = [
    { met: password.length >= 8, text: 'Mínimo 8 caracteres' },
    { met: /[a-z]/.test(password), text: 'Uma letra minúscula' },
    { met: /[A-Z]/.test(password), text: 'Uma letra maiúscula' },
    { met: /\d/.test(password), text: 'Um número' },
    { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), text: 'Um caractere especial' },
  ];
  
  const score = requirements.filter(req => req.met).length;
  
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score <= 2) strength = 'weak';
  else if (score === 3) strength = 'medium';
  else if (score === 4) strength = 'strong';
  else strength = 'very-strong';
  
  return {
    isValid: score >= 4,
    strength,
    score,
    requirements
  };
}

/**
 * Check if domain exists (basic DNS check suggestion)
 */
export function suggestEmailDomainCheck(email: string): string[] {
  const suggestions: string[] = [];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) return suggestions;
  
  // Common domain typos
  const commonDomains = [
    'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 
    'uol.com.br', 'terra.com.br', 'ig.com.br'
  ];
  
  const similarDomains = commonDomains.filter(common => {
    const similarity = calculateSimilarity(domain, common);
    return similarity > 0.6 && similarity < 1;
  });
  
  if (similarDomains.length > 0) {
    suggestions.push(`Você quis dizer: ${email.split('@')[0]}@${similarDomains[0]}?`);
  }
  
  return suggestions;
}

/**
 * Calculate string similarity (Jaro-Winkler distance)
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0 || len2 === 0) return 0;
  
  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0;
  
  // Find transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  
  return jaro;
}

// =============================================================================
// VALIDATION RULE FACTORY
// =============================================================================

export const ValidationRules = {
  required: (message = 'Este campo é obrigatório'): ValidationRule => ({
    type: 'required',
    message,
    validator: (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value != null && value !== '';
    }
  }),
  
  email: (message = 'E-mail inválido'): ValidationRule => ({
    type: 'email',
    message,
    validator: (value) => {
      if (!value) return true; // Optional field
      return UX_CONFIG.VALIDATION.EMAIL_PATTERN.test(value);
    }
  }),
  
  phone: (message = 'Telefone inválido'): ValidationRule => ({
    type: 'phone',
    message,
    validator: (value) => {
      if (!value) return true; // Optional field
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length === 10 || cleaned.length === 11;
    }
  }),
  
  cpf: (message = 'CPF inválido'): ValidationRule => ({
    type: 'cpf',
    message,
    validator: (value) => {
      if (!value) return true; // Optional field
      return validateCPF(value);
    }
  }),
  
  cnpj: (message = 'CNPJ inválido'): ValidationRule => ({
    type: 'cnpj',
    message,
    validator: (value) => {
      if (!value) return true; // Optional field
      return validateCNPJ(value);
    }
  }),
  
  url: (message = 'URL inválida'): ValidationRule => ({
    type: 'url',
    message,
    validator: (value) => {
      if (!value) return true; // Optional field
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    type: 'min',
    value: min,
    message: message || `Mínimo de ${min} caracteres`,
    validator: (value) => {
      if (!value) return true; // Optional field
      return value.length >= min;
    }
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    type: 'max',
    value: max,
    message: message || `Máximo de ${max} caracteres`,
    validator: (value) => {
      if (!value) return true; // Optional field
      return value.length <= max;
    }
  }),
  
  pattern: (pattern: RegExp, message: string): ValidationRule => ({
    type: 'pattern',
    value: pattern,
    message,
    validator: (value) => {
      if (!value) return true; // Optional field
      return pattern.test(value);
    }
  }),
  
  currency: (message = 'Valor monetário inválido'): ValidationRule => ({
    type: 'currency',
    message,
    validator: (value) => {
      if (!value) return true; // Optional field
      const cleaned = value.toString().replace(/[^\d.,]/g, '');
      const number = parseFloat(cleaned.replace(',', '.'));
      return !isNaN(number) && number >= 0;
    }
  }),
  
  dateRange: (
    minDate?: Date, 
    maxDate?: Date, 
    message = 'Data fora do intervalo permitido'
  ): ValidationRule => ({
    type: 'date',
    message,
    validator: (value) => {
      if (!value) return true; // Optional field
      const date = new Date(value);
      if (isNaN(date.getTime())) return false;
      
      if (minDate && date < minDate) return false;
      if (maxDate && date > maxDate) return false;
      
      return true;
    }
  }),
  
  password: (message = 'Senha deve ter pelo menos 8 caracteres com letras, números e símbolos'): ValidationRule => ({
    type: 'password',
    message,
    validator: (value) => {
      if (!value) return true; // Optional field
      const result = validatePasswordStrength(value);
      return result.score >= 4;
    }
  }),
  
  custom: (validator: (value: any) => boolean | Promise<boolean>, message: string): ValidationRule => ({
    type: 'custom',
    message,
    validator
  })
};

// =============================================================================
// GLOBAL VALIDATOR CLASS
// =============================================================================

export class GlobalValidator {
  private static instance: GlobalValidator;
  private validationRules: Map<string, ValidationRule[]> = new Map();
  
  static getInstance(): GlobalValidator {
    if (!GlobalValidator.instance) {
      GlobalValidator.instance = new GlobalValidator();
    }
    return GlobalValidator.instance;
  }
  
  /**
   * Register validation rules for a form
   */
  registerForm(formId: string, rules: Record<string, ValidationRule[]>): void {
    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      this.validationRules.set(`${formId}.${fieldName}`, fieldRules);
    });
  }
  
  /**
   * Validate a single field
   */
  async validateField(formId: string, fieldName: string, value: any): Promise<ValidationResult> {
    const rules = this.validationRules.get(`${formId}.${fieldName}`) || [];
    
    for (const rule of rules) {
      if (rule.validator) {
        try {
          const isValid = await rule.validator(value);
          if (!isValid) {
            const result: ValidationResult = {
              isValid: false,
              message: rule.message,
              severity: rule.severity || 'error'
            };
            
            // Add suggestions for specific validation types
            if (rule.type === 'email') {
              result.suggestions = suggestEmailDomainCheck(value || '');
            }
            
            return result;
          }
        } catch (error) {
          console.error(`Validation error for ${fieldName}:`, error);
          return {
            isValid: false,
            message: 'Erro na validação',
            severity: 'error'
          };
        }
      }
    }
    
    return { isValid: true };
  }
  
  /**
   * Validate entire form
   */
  async validateForm(formId: string, values: Record<string, any>): Promise<Record<string, ValidationResult>> {
    const results: Record<string, ValidationResult> = {};
    
    // Get all fields for this form
    const formFields = Array.from(this.validationRules.keys())
      .filter(key => key.startsWith(`${formId}.`))
      .map(key => key.substring(formId.length + 1));
    
    // Validate each field
    for (const fieldName of formFields) {
      results[fieldName] = await this.validateField(formId, fieldName, values[fieldName]);
    }
    
    return results;
  }
  
  /**
   * Check if form is valid
   */
  isFormValid(results: Record<string, ValidationResult>): boolean {
    return Object.values(results).every(result => result.isValid);
  }
  
  /**
   * Get all error messages
   */
  getErrorMessages(results: Record<string, ValidationResult>): Record<string, string> {
    const errors: Record<string, string> = {};
    
    Object.entries(results).forEach(([fieldName, result]) => {
      if (!result.isValid && result.message) {
        errors[fieldName] = result.message;
      }
    });
    
    return errors;
  }
  
  /**
   * Get field formatter function
   */
  getFormatter(fieldType: 'phone' | 'cpf' | 'cnpj' | 'currency'): (value: string) => string {
    switch (fieldType) {
      case 'phone':
        return formatPhone;
      case 'cpf':
        return formatCPF;
      case 'cnpj':
        return formatCNPJ;
      case 'currency':
        return formatCurrency;
      default:
        return (value: string) => value;
    }
  }
}

// Export singleton instance
export const globalValidator = GlobalValidator.getInstance();

// =============================================================================
// COMMON FORM VALIDATION PRESETS
// =============================================================================

export const CommonValidations = {
  // Lead form validations
  lead: {
    name: [ValidationRules.required('Nome é obrigatório'), ValidationRules.minLength(2)],
    email: [ValidationRules.email()],
    phone: [ValidationRules.phone()],
    source: [ValidationRules.required('Origem é obrigatória')]
  },
  
  // Property form validations
  property: {
    title: [ValidationRules.required('Título é obrigatório'), ValidationRules.minLength(10)],
    type: [ValidationRules.required('Tipo é obrigatório')],
    purpose: [ValidationRules.required('Finalidade é obrigatória')],
    sale_price: [ValidationRules.currency()],
    rent_price: [ValidationRules.currency()],
    owner_email: [ValidationRules.email()],
    owner_phone: [ValidationRules.phone()],
    virtual_tour_url: [ValidationRules.url()],
    youtube_url: [ValidationRules.url()],
    video_url: [ValidationRules.url()]
  },
  
  // User form validations
  user: {
    name: [ValidationRules.required('Nome é obrigatório'), ValidationRules.minLength(2)],
    email: [ValidationRules.required('E-mail é obrigatório'), ValidationRules.email()],
    phone: [ValidationRules.phone()],
    cpf: [ValidationRules.cpf()],
    password: [ValidationRules.password()],
    role: [ValidationRules.required('Função é obrigatória')]
  },
  
  // Task form validations
  task: {
    title: [ValidationRules.required('Título é obrigatório'), ValidationRules.minLength(5)],
    description: [ValidationRules.maxLength(500)],
    due_date: [ValidationRules.dateRange(new Date(), undefined, 'Data deve ser futura')],
    priority: [ValidationRules.required('Prioridade é obrigatória')]
  },
  
  // Login form validations
  login: {
    email: [ValidationRules.required('E-mail é obrigatório'), ValidationRules.email()],
    password: [ValidationRules.required('Senha é obrigatória'), ValidationRules.minLength(6)]
  }
};