/**
 * Exemplos de uso do sistema de validação de ambiente
 * Este arquivo demonstra como usar as validações em diferentes contextos
 */

import { 
  getEnvConfig, 
  getAIConfig, 
  isAIConfigured,
  isMessagingConfigured,
  isDevelopment 
} from './index';

// ============================================
// EXEMPLO 1: Usar em um serviço de IA
// ============================================

export class AIServiceExample {
  private config: ReturnType<typeof getAIConfig>;
  
  constructor() {
    // Verificar se IA está configurada antes de inicializar
    if (!isAIConfigured()) {
      throw new Error('Serviço de IA não está configurado. Configure OPENAI_API_KEY ou AZURE_OPENAI_API_KEY');
    }
    
    // Obter configuração de IA (OpenAI ou Azure)
    this.config = getAIConfig();
  }
  
  async chat(message: string) {
    if (this.config.provider === 'openai') {
      // Usar OpenAI
      console.log('Usando OpenAI com key:', this.config.apiKey.substring(0, 10) + '...');
    } else if (this.config.provider === 'azure') {
      // Usar Azure OpenAI
      console.log('Usando Azure OpenAI:', this.config.endpoint);
    }
  }
}

// ============================================
// EXEMPLO 2: Usar em um serviço de mensageria
// ============================================

export class MessagingServiceExample {
  private config = getEnvConfig();
  
  async sendMessage(to: string, message: string, channel: 'email' | 'whatsapp' | 'sms') {
    const messaging = isMessagingConfigured();
    
    switch (channel) {
      case 'email':
        if (!messaging.email) {
          throw new Error('Email não está configurado. Configure SENDGRID_API_KEY');
        }
        // Usar SendGrid
        console.log('Enviando email com SendGrid');
        break;
        
      case 'whatsapp':
        if (!messaging.whatsapp) {
          throw new Error('WhatsApp não está configurado. Configure EVOLUTION_API_KEY');
        }
        // Usar Evolution API
        const evolution = this.config.messaging.evolution!;
        console.log('Enviando WhatsApp via:', evolution.url);
        break;
        
      case 'sms':
        if (!messaging.sms) {
          throw new Error('SMS não está configurado. Configure TWILIO_ACCOUNT_SID');
        }
        // Usar Twilio
        const twilio = this.config.messaging.twilio!;
        console.log('Enviando SMS com Twilio:', twilio.phoneNumber);
        break;
    }
  }
}

// ============================================
// EXEMPLO 3: Usar em uma API route
// ============================================

export async function apiRouteExample(request: Request) {
  const config = getEnvConfig();
  
  // Verificar se está em produção
  if (config.env === 'production') {
    // Aplicar validações mais rigorosas
    console.log('Ambiente de produção - validações extras ativadas');
  }
  
  // Verificar funcionalidades disponíveis
  if (!isAIConfigured()) {
    return new Response(
      JSON.stringify({ error: 'Funcionalidade de IA não disponível' }), 
      { status: 503 }
    );
  }
  
  // Continuar com a lógica...
}

// ============================================
// EXEMPLO 4: Usar em testes
// ============================================

export function testExample() {
  // Em testes, pode querer pular certas validações
  if (isDevelopment() || process.env.NODE_ENV === 'test') {
    console.log('Modo desenvolvimento/teste - validações relaxadas');
  }
  
  // Verificar configurações específicas para teste
  const config = getEnvConfig();
  if (config.redis.db !== 6) {
    console.warn('⚠️  Usando banco Redis diferente do padrão');
  }
}

// ============================================
// EXEMPLO 5: Inicialização condicional
// ============================================

export class ConditionalService {
  private emailEnabled: boolean;
  private whatsappEnabled: boolean;
  private aiEnabled: boolean;
  
  constructor() {
    const messaging = isMessagingConfigured();
    
    this.emailEnabled = messaging.email;
    this.whatsappEnabled = messaging.whatsapp;
    this.aiEnabled = isAIConfigured();
    
    console.log('Serviços disponíveis:', {
      email: this.emailEnabled,
      whatsapp: this.whatsappEnabled,
      ai: this.aiEnabled
    });
  }
  
  getAvailableChannels(): string[] {
    const channels: string[] = [];
    
    if (this.emailEnabled) channels.push('email');
    if (this.whatsappEnabled) channels.push('whatsapp');
    
    return channels;
  }
}