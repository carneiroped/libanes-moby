/**
 * Helpers para trabalhar com variáveis de ambiente validadas
 * Fornece acesso seguro e tipado às variáveis
 */

import { 
  isAIConfigured, 
  isMessagingConfigured,
  getRedisUrl 
} from './env-validation';

// Tipos para variáveis de ambiente
export interface EnvConfig {
  // Core
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  
  // Redis
  redis: {
    url: string;
    host: string;
    port: number;
    db: number;
    username?: string;
    password?: string;
  };
  
  // Security
  security: {
    apiKeyEncryptionSecret: string;
    apiKeyEncryptionSalt: string;
  };
  
  // AI
  ai: {
    openai?: {
      apiKey: string;
      publicApiKey?: string;
    };
    azure?: {
      endpoint: string;
      apiKey: string;
      deploymentName: string;
      apiVersion: string;
    };
    assemblyai?: {
      apiKey: string;
    };
    elevenlabs?: {
      apiKey: string;
      voiceId: string;
    };
  };
  
  // Messaging
  messaging: {
    sendgrid?: {
      apiKey: string;
    };
    evolution?: {
      url: string;
      apiKey: string;
      instanceName: string;
    };
    twilio?: {
      accountSid: string;
      authToken: string;
      phoneNumber: string;
    };
  };
  
  // Environment
  env: 'development' | 'production' | 'test';
}

/**
 * Obtém configuração completa e validada do ambiente
 */
export function getEnvConfig(): EnvConfig {
  // Core - sempre obrigatório
  const supabase = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  };
  
  // Redis
  const redis = {
    url: getRedisUrl(),
    host: process.env.REDIS_HOST || '52.188.186.112',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    db: parseInt(process.env.REDIS_DB || '6'),
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD
  };
  
  // Security
  const security = {
    apiKeyEncryptionSecret: process.env.API_KEY_ENCRYPTION_SECRET!,
    apiKeyEncryptionSalt: process.env.API_KEY_ENCRYPTION_SALT!
  };
  
  // AI - condicional
  const ai: EnvConfig['ai'] = {};
  
  if (process.env.OPENAI_API_KEY) {
    ai.openai = {
      apiKey: process.env.OPENAI_API_KEY,
      publicApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
    };
  }
  
  if (process.env.AZURE_OPENAI_API_KEY) {
    ai.azure = {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview'
    };
  }
  
  if (process.env.ASSEMBLYAI_API_KEY) {
    ai.assemblyai = {
      apiKey: process.env.ASSEMBLYAI_API_KEY
    };
  }
  
  if (process.env.ELEVENLABS_API_KEY) {
    ai.elevenlabs = {
      apiKey: process.env.ELEVENLABS_API_KEY,
      voiceId: process.env.ELEVENLABS_VOICE_ID!
    };
  }
  
  // Messaging - condicional
  const messaging: EnvConfig['messaging'] = {};
  
  if (process.env.SENDGRID_API_KEY) {
    messaging.sendgrid = {
      apiKey: process.env.SENDGRID_API_KEY
    };
  }
  
  if (process.env.EVOLUTION_API_KEY) {
    messaging.evolution = {
      url: process.env.EVOLUTION_API_URL || 'https://evolution.moby.website',
      apiKey: process.env.EVOLUTION_API_KEY,
      instanceName: process.env.EVOLUTION_INSTANCE_NAME!
    };
  }
  
  if (process.env.TWILIO_ACCOUNT_SID) {
    messaging.twilio = {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER!
    };
  }
  
  // Environment
  const env = (process.env.NODE_ENV || 'development') as EnvConfig['env'];
  
  return {
    supabase,
    redis,
    security,
    ai,
    messaging,
    env
  };
}

/**
 * Obtém configuração de IA preferencial
 * Retorna OpenAI por padrão, ou Azure se configurado
 */
export function getAIConfig() {
  const config = getEnvConfig();
  
  if (config.ai.openai) {
    return {
      provider: 'openai' as const,
      ...config.ai.openai
    };
  }
  
  if (config.ai.azure) {
    return {
      provider: 'azure' as const,
      ...config.ai.azure
    };
  }
  
  throw new Error('Nenhum provedor de IA configurado');
}

/**
 * Verifica se está em ambiente de desenvolvimento
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Verifica se está em ambiente de produção
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Verifica se está em ambiente de teste
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Obtém URL base da aplicação
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (isProduction()) {
    return 'https://moby.casa';
  }
  
  return 'http://localhost:3000';
}

// Re-exportar funções de validação
export { isAIConfigured, isMessagingConfigured, getRedisUrl };