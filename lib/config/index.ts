/**
 * Ponto de entrada principal para configurações e validações
 * Exporta todas as funções úteis de configuração
 */

// Validação de ambiente
export {
  validateEnvironment,
  printValidationReport,
  generateEnvExample,
  isAIConfigured,
  isMessagingConfigured,
  getRedisUrl
} from './env-validation';

// Helpers de configuração
export {
  getEnvConfig,
  getAIConfig,
  isDevelopment,
  isProduction,
  isTest,
  getAppUrl,
  type EnvConfig
} from './env-helpers';

// Validação na inicialização
export { validateOnStartup, validationResult } from './validate-on-startup';