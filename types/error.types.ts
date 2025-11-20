/**
 * Error Handling Type Definitions
 * 
 * Comprehensive error types for robust error handling,
 * user feedback, and debugging across the application.
 */

// Base Error Interface
export interface BaseError {
  message: string;
  code?: string;
  timestamp: string;
  requestId?: string;
  userMessage?: string;
}

// Application Error Types
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'network'
  | 'api'
  | 'database'
  | 'ui'
  | 'business'
  | 'system'
  | 'external';

export interface AppError extends BaseError {
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: Record<string, any>;
  stack?: string;
  cause?: Error | AppError;
  recoverable: boolean;
  retryable: boolean;
  userAction?: UserAction;
}

export interface UserAction {
  type: 'retry' | 'refresh' | 'navigate' | 'contact_support' | 'ignore';
  label: string;
  action?: () => void | Promise<void>;
}

// Specific Error Types
export interface ValidationError extends BaseError {
  field?: string;
  fields?: Record<string, string[]>;
  value?: any;
}

export interface NetworkError extends BaseError {
  status?: number;
  statusText?: string;
  url?: string;
  method?: string;
  timeout?: boolean;
  offline?: boolean;
}

export interface ApiError extends BaseError {
  endpoint: string;
  method: string;
  status: number;
  statusText: string;
  response?: any;
  retryAfter?: number;
}

export interface AuthenticationError extends BaseError {
  reason: 'invalid_credentials' | 'token_expired' | 'user_not_found' | 'account_locked';
  loginUrl?: string;
}

export interface AuthorizationError extends BaseError {
  requiredPermission?: string;
  userRole?: string;
  resource?: string;
}

export interface BusinessRuleError extends BaseError {
  rule: string;
  entity?: string;
  entityId?: string;
  constraints?: Record<string, any>;
}

export interface ExternalServiceError extends BaseError {
  service: string;
  serviceError?: any;
  fallbackAvailable?: boolean;
}

export interface UIError extends BaseError {
  component?: string;
  props?: Record<string, any>;
  recoverable: boolean;
}

// Error State Management
export interface ErrorState {
  hasError: boolean;
  errors: AppError[];
  lastError?: AppError;
  errorCount: number;
  suppressedErrors: string[];
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: {
    componentStack: string;
  };
  errorId: string;
  timestamp: string;
}

// Error Response from API
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, any>;
    validation?: ValidationError[];
  };
  timestamp: string;
  requestId?: string;
}

// Common Error Codes
export enum ErrorCode {
  // Authentication Errors
  INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED',
  
  // Authorization Errors
  PERMISSION_DENIED = 'AUTH_PERMISSION_DENIED',
  INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  RESOURCE_FORBIDDEN = 'AUTH_RESOURCE_FORBIDDEN',
  
  // Validation Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALUE_TOO_LONG = 'VALIDATION_VALUE_TOO_LONG',
  VALUE_TOO_SHORT = 'VALIDATION_VALUE_TOO_SHORT',
  INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
  INVALID_PHONE = 'VALIDATION_INVALID_PHONE',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'NETWORK_TIMEOUT',
  CONNECTION_ERROR = 'NETWORK_CONNECTION_ERROR',
  OFFLINE_ERROR = 'NETWORK_OFFLINE',
  
  // API Errors
  API_ERROR = 'API_ERROR',
  NOT_FOUND = 'API_NOT_FOUND',
  CONFLICT = 'API_CONFLICT',
  RATE_LIMITED = 'API_RATE_LIMITED',
  SERVER_ERROR = 'API_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'API_SERVICE_UNAVAILABLE',
  
  // Business Logic Errors
  DUPLICATE_ENTRY = 'BUSINESS_DUPLICATE_ENTRY',
  INVALID_STATE = 'BUSINESS_INVALID_STATE',
  CONSTRAINT_VIOLATION = 'BUSINESS_CONSTRAINT_VIOLATION',
  QUOTA_EXCEEDED = 'BUSINESS_QUOTA_EXCEEDED',
  
  // External Service Errors
  WHATSAPP_ERROR = 'EXTERNAL_WHATSAPP_ERROR',
  EMAIL_ERROR = 'EXTERNAL_EMAIL_ERROR',
  SMS_ERROR = 'EXTERNAL_SMS_ERROR',
  PAYMENT_ERROR = 'EXTERNAL_PAYMENT_ERROR',
  
  // System Errors
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  DATABASE_ERROR = 'SYSTEM_DATABASE_ERROR',
  CONFIGURATION_ERROR = 'SYSTEM_CONFIGURATION_ERROR',
  
  // UI Errors
  COMPONENT_ERROR = 'UI_COMPONENT_ERROR',
  RENDER_ERROR = 'UI_RENDER_ERROR',
  STATE_ERROR = 'UI_STATE_ERROR'
}

// Error Utility Types
export type ErrorHandler<T = any> = (error: AppError, context?: T) => void | Promise<void>;
export type ErrorRecovery<T = any> = (error: AppError, context?: T) => Promise<boolean>;
export type ErrorReporter = (error: AppError) => void | Promise<void>;

// Error Configuration
export interface ErrorConfig {
  maxErrors: number;
  suppressDuplicates: boolean;
  suppressedCodes: ErrorCode[];
  autoRetryEnabled: boolean;
  maxRetries: number;
  retryDelay: number;
  reportingEnabled: boolean;
  debugMode: boolean;
}

// Custom Error Classes
export class AppException extends Error implements AppError {
  public readonly timestamp: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly recoverable: boolean;
  public readonly retryable: boolean;
  public readonly context?: Record<string, any>;
  public readonly userMessage?: string;
  public readonly userAction?: UserAction;
  public readonly cause?: Error | AppError;

  constructor(
    message: string,
    public readonly code: string,
    severity: ErrorSeverity = 'medium',
    category: ErrorCategory = 'system',
    options: {
      cause?: Error | AppError;
      context?: Record<string, any>;
      userMessage?: string;
      userAction?: UserAction;
      recoverable?: boolean;
      retryable?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'AppException';
    this.timestamp = new Date().toISOString();
    this.severity = severity;
    this.category = category;
    this.recoverable = options.recoverable ?? true;
    this.retryable = options.retryable ?? false;
    this.context = options.context;
    this.userMessage = options.userMessage;
    this.userAction = options.userAction;
    
    // Properly handle cause assignment
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

export class ValidationException extends AppException {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any,
    context?: Record<string, any>
  ) {
    super(
      message,
      ErrorCode.VALIDATION_FAILED,
      'low',
      'validation',
      {
        context: {
          field,
          value,
          ...context
        },
        recoverable: true,
        retryable: false,
        userMessage: message
      }
    );
    this.name = 'ValidationException';
  }
}

export class NetworkException extends AppException {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly url?: string,
    public readonly method?: string
  ) {
    super(
      message,
      ErrorCode.NETWORK_ERROR,
      'medium',
      'network',
      {
        context: { status, url, method },
        recoverable: true,
        retryable: true,
        userMessage: 'Erro de conexão. Verifique sua internet e tente novamente.',
        userAction: {
          type: 'retry',
          label: 'Tentar novamente'
        }
      }
    );
    this.name = 'NetworkException';
  }
}

export class ApiException extends AppException {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly status: number,
    public readonly response?: any
  ) {
    const severity: ErrorSeverity = status >= 500 ? 'high' : status >= 400 ? 'medium' : 'low';
    const retryable = status >= 500 || status === 429;
    
    super(
      message,
      ErrorCode.API_ERROR,
      severity,
      'api',
      {
        context: { endpoint, status, response },
        recoverable: true,
        retryable,
        userMessage: ApiException.getUserMessage(status),
        userAction: retryable ? {
          type: 'retry',
          label: 'Tentar novamente'
        } : undefined
      }
    );
    this.name = 'ApiException';
  }

  private static getUserMessage(status: number): string {
    switch (true) {
      case status === 400:
        return 'Dados inválidos enviados.';
      case status === 401:
        return 'Sessão expirada. Faça login novamente.';
      case status === 403:
        return 'Você não tem permissão para realizar esta ação.';
      case status === 404:
        return 'Recurso não encontrado.';
      case status === 429:
        return 'Muitas tentativas. Aguarde um momento e tente novamente.';
      case status >= 500:
        return 'Erro interno do servidor. Tente novamente em alguns instantes.';
      default:
        return 'Erro na comunicação com o servidor.';
    }
  }
}

export class BusinessRuleException extends AppException {
  constructor(
    message: string,
    public readonly rule: string,
    public readonly entity?: string,
    public readonly entityId?: string
  ) {
    super(
      message,
      ErrorCode.CONSTRAINT_VIOLATION,
      'medium',
      'business',
      {
        context: { rule, entity, entityId },
        recoverable: false,
        retryable: false,
        userMessage: message
      }
    );
    this.name = 'BusinessRuleException';
  }
}

// Error Type Guards
export function isAppError(error: any): error is AppError {
  return error && 
         typeof error === 'object' && 
         typeof error.message === 'string' &&
         typeof error.severity === 'string' &&
         typeof error.category === 'string';
}

export function isValidationError(error: any): error is ValidationError {
  return error && 
         typeof error === 'object' && 
         typeof error.message === 'string' &&
         (error.field !== undefined || error.fields !== undefined);
}

export function isNetworkError(error: any): error is NetworkError {
  return error && 
         typeof error === 'object' && 
         typeof error.message === 'string' &&
         (error.status !== undefined || error.offline !== undefined);
}

export function isApiError(error: any): error is ApiError {
  return error && 
         typeof error === 'object' && 
         typeof error.message === 'string' &&
         typeof error.endpoint === 'string' &&
         typeof error.status === 'number';
}

// Error Utility Functions
export function createError(
  message: string,
  code: ErrorCode,
  severity: ErrorSeverity = 'medium',
  category: ErrorCategory = 'system',
  context?: Record<string, any>
): AppError {
  return {
    message,
    code,
    severity,
    category,
    timestamp: new Date().toISOString(),
    context,
    recoverable: true,
    retryable: false
  };
}

export function wrapError(error: Error, context?: Record<string, any>): AppError {
  return {
    message: error.message,
    code: ErrorCode.SYSTEM_ERROR,
    severity: 'medium',
    category: 'system',
    timestamp: new Date().toISOString(),
    context,
    stack: error.stack,
    recoverable: true,
    retryable: false
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (isAppError(error)) {
    return error.userMessage || error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
}

export function shouldRetry(error: AppError, attemptCount: number, maxAttempts: number = 3): boolean {
  return error.retryable && attemptCount < maxAttempts;
}

export function getRetryDelay(attemptCount: number, baseDelay: number = 1000): number {
  return baseDelay * Math.pow(2, attemptCount - 1); // Exponential backoff
}

// Error Reporting Types
export interface ErrorReport {
  error: AppError;
  userAgent: string;
  url: string;
  userId?: string;
  accountId?: string;
  sessionId?: string;
  buildVersion?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCode: Record<string, number>;
  errorRate: number;
  meanTimeToResolve: number;
}

// Export commonly used error types as namespace
export namespace Errors {
  export type App = AppError;
  export type Validation = ValidationError;  
  export type Network = NetworkError;
  export type Api = ApiError;
  export type Authentication = AuthenticationError;
  export type Authorization = AuthorizationError;
  export type BusinessRule = BusinessRuleError;
  export type External = ExternalServiceError;
  export type UI = UIError;
}