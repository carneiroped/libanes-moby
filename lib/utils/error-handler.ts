/**
 * Secure error handling utilities
 * Prevents sensitive information leakage while maintaining useful error messages
 */

import { NextResponse } from 'next/server';

/**
 * Error types for better categorization
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT_EXCEEDED',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  INTERNAL = 'INTERNAL_SERVER_ERROR',
}

/**
 * Application error class with safe error messages
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Predefined error creators
 */
export const errors = {
  validation: (message: string, details?: any) =>
    new AppError(message, ErrorType.VALIDATION, 400, true, details),

  notFound: (resource: string = 'Resource') =>
    new AppError(`${resource} not found`, ErrorType.NOT_FOUND, 404),

  conflict: (message: string) =>
    new AppError(message, ErrorType.CONFLICT, 409),

  unauthorized: (message: string = 'Authentication required') =>
    new AppError(message, ErrorType.AUTHENTICATION, 401),

  forbidden: (message: string = 'Insufficient permissions') =>
    new AppError(message, ErrorType.AUTHORIZATION, 403),

  rateLimit: (message: string = 'Too many requests') =>
    new AppError(message, ErrorType.RATE_LIMIT, 429),

  database: (operation: string = 'database operation') =>
    new AppError(
      `Failed to perform ${operation}`,
      ErrorType.DATABASE,
      500,
      true
    ),

  externalAPI: (service: string) =>
    new AppError(
      `External service ${service} is unavailable`,
      ErrorType.EXTERNAL_API,
      503,
      true
    ),

  internal: (message: string = 'An unexpected error occurred') =>
    new AppError(message, ErrorType.INTERNAL, 500, false),
};

/**
 * Safe error response that doesn't leak sensitive information
 */
interface ErrorResponse {
  error: string;
  type?: string;
  details?: any;
  requestId?: string;
}

/**
 * Convert error to safe response object
 */
export function toErrorResponse(
  error: unknown,
  requestId?: string,
  includeStack: boolean = false
): ErrorResponse {
  const isProduction = process.env.NODE_ENV === 'production';

  // Handle AppError instances
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: error.message,
      type: error.type,
      requestId,
    };

    // Only include details in development
    if (!isProduction && error.details) {
      response.details = error.details;
    }

    return response;
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = isProduction
      ? 'An unexpected error occurred'
      : error.message;

    const response: ErrorResponse = {
      error: message,
      type: ErrorType.INTERNAL,
      requestId,
    };

    // Include stack trace only in development
    if (!isProduction && includeStack) {
      response.details = { stack: error.stack };
    }

    return response;
  }

  // Handle unknown error types
  return {
    error: 'An unexpected error occurred',
    type: ErrorType.INTERNAL,
    requestId,
  };
}

/**
 * Create NextResponse from error
 */
export function errorResponse(
  error: unknown,
  requestId?: string
): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      toErrorResponse(error, requestId),
      { status: error.statusCode }
    );
  }

  // Default to 500 for unknown errors
  return NextResponse.json(
    toErrorResponse(error, requestId),
    { status: 500 }
  );
}

/**
 * Log error securely (prevents logging sensitive data)
 */
export function logError(
  error: unknown,
  context: string,
  metadata?: Record<string, any>
) {
  const timestamp = new Date().toISOString();
  const isProduction = process.env.NODE_ENV === 'production';

  if (error instanceof AppError) {
    // Log operational errors with context
    console.error(
      `[${timestamp}] [${context}] ${error.type}: ${error.message}`,
      isProduction ? '' : error.details
    );
  } else if (error instanceof Error) {
    // Log unexpected errors with stack trace in development
    console.error(
      `[${timestamp}] [${context}] UNEXPECTED_ERROR: ${error.message}`
    );
    if (!isProduction) {
      console.error(error.stack);
    }
  } else {
    // Log unknown error types
    console.error(
      `[${timestamp}] [${context}] UNKNOWN_ERROR:`,
      isProduction ? 'Error details hidden' : error
    );
  }

  // Log additional metadata if provided
  if (metadata && !isProduction) {
    console.error(`[${timestamp}] [${context}] Metadata:`, metadata);
  }
}

/**
 * Parse database errors into user-friendly messages
 */
export function parseDatabaseError(error: any): AppError {
  // PostgreSQL error codes
  const errorCode = error.code;

  switch (errorCode) {
    case '23505': // unique_violation
      return errors.conflict('A record with this information already exists');

    case '23503': // foreign_key_violation
      return errors.validation(
        'Cannot perform this operation due to related records'
      );

    case '23502': // not_null_violation
      return errors.validation('Required field is missing');

    case '22P02': // invalid_text_representation
      return errors.validation('Invalid data format');

    case '42501': // insufficient_privilege
      return errors.forbidden('Insufficient database permissions');

    case '08006': // connection_failure
    case '08003': // connection_does_not_exist
      return errors.database('database connection');

    case '57014': // query_canceled
      return errors.internal('Operation timed out');

    default:
      // Don't expose database error details in production
      if (process.env.NODE_ENV === 'production') {
        return errors.database();
      }
      return errors.database(error.message || 'database operation');
  }
}

/**
 * Try-catch wrapper that automatically handles errors
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logError(error, context);
    throw error;
  }
}

/**
 * Generate unique request ID for error tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
