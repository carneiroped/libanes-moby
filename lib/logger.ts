/**
 * Logger Condicional
 * Apenas loga em desenvolvimento, silencia em produção
 */

const isDev = process.env.NODE_ENV === 'development';
const isBrowser = typeof window !== 'undefined';

/**
 * Sanitizar dados sensíveis antes de logar
 */
function sanitize(data: any): any {
  if (!data) return data;

  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];

  if (typeof data === 'object') {
    const sanitized: any = Array.isArray(data) ? [] : {};

    for (const key in data) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof data[key] === 'object') {
        sanitized[key] = sanitize(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    }

    return sanitized;
  }

  return data;
}

/**
 * Logger principal
 */
export const logger = {
  /**
   * Log de debug (apenas em dev)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      const sanitizedArgs = args.map(sanitize);
      console.log('[DEBUG]', ...sanitizedArgs);
    }
  },

  /**
   * Log de informação (apenas em dev)
   */
  info: (...args: any[]) => {
    if (isDev) {
      const sanitizedArgs = args.map(sanitize);
      console.log('[INFO]', ...sanitizedArgs);
    }
  },

  /**
   * Log de warning (sempre)
   */
  warn: (...args: any[]) => {
    const sanitizedArgs = args.map(sanitize);
    console.warn('[WARN]', ...sanitizedArgs);
  },

  /**
   * Log de erro (sempre)
   */
  error: (...args: any[]) => {
    const sanitizedArgs = args.map(sanitize);
    console.error('[ERROR]', ...sanitizedArgs);
  },

  /**
   * Log de sucesso (apenas em dev)
   */
  success: (...args: any[]) => {
    if (isDev) {
      const sanitizedArgs = args.map(sanitize);
      console.log('✅ [SUCCESS]', ...sanitizedArgs);
    }
  },

  /**
   * Log de auth events (apenas em dev)
   */
  auth: (event: string, ...args: any[]) => {
    if (isDev) {
      const sanitizedArgs = args.map(sanitize);
      console.log(`🔐 [AUTH:${event}]`, ...sanitizedArgs);
    }
  },

  /**
   * Log de API requests (apenas em dev)
   */
  api: (method: string, endpoint: string, ...args: any[]) => {
    if (isDev) {
      const sanitizedArgs = args.map(sanitize);
      console.log(`🌐 [API:${method}] ${endpoint}`, ...sanitizedArgs);
    }
  },

  /**
   * Performance timing (apenas em dev)
   */
  time: (label: string) => {
    if (isDev && isBrowser) {
      console.time(`⏱️ [TIME] ${label}`);
    }
  },

  timeEnd: (label: string) => {
    if (isDev && isBrowser) {
      console.timeEnd(`⏱️ [TIME] ${label}`);
    }
  },

  /**
   * Group logs (apenas em dev)
   */
  group: (label: string) => {
    if (isDev) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },

  /**
   * Tabela de dados (apenas em dev)
   */
  table: (data: any) => {
    if (isDev) {
      console.table(sanitize(data));
    }
  }
};

/**
 * Hook de erro global (browser only)
 */
if (isBrowser && !isDev) {
  window.addEventListener('error', (event) => {
    // Em produção, enviar para serviço de monitoramento
    // Ex: Sentry, LogRocket, etc.
    logger.error('Uncaught error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection:', event.reason);
  });
}

export default logger;
