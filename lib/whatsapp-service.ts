// WhatsApp Cloud API Integration Service
// Azure API removed - using direct Evolution API integration

// Interface para configurações do WhatsApp
export interface WhatsAppConfig {
  apiVersion: string;
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
}

// Interface para logs de mensagem
export interface WhatsAppMessageLog {
  id?: string;
  phone: string;
  message: string;
  messageId?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'error';
  responseData?: any;
  createdAt?: string;
  accountId: string;
}

// Interface para resposta da API do WhatsApp
export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Interface para configuração do sistema
interface SystemConfig {
  id: string;
  configKey: string;
  configValue: WhatsAppConfig;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Carrega as configurações da API do WhatsApp das variáveis de ambiente
 */
export const loadWhatsAppConfig = async (): Promise<WhatsAppConfig> => {
  // Usar variáveis de ambiente diretamente (sem Azure API)
  return {
    apiVersion: process.env.NEXT_PUBLIC_WHATSAPP_API_VERSION || 'v18.0',
    accessToken: process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID || ''
  };
};

/**
 * Envia uma mensagem de texto para o WhatsApp
 * @param phone Número de telefone do destinatário (formato internacional)
 * @param message Texto da mensagem
 * @returns Sucesso ou erro do envio
 */
export const sendWhatsAppMessage = async (
  phone: string,
  message: string
): Promise<WhatsAppResponse> => {
  try {
    // Garantir que o número de telefone esteja no formato internacional
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = `55${formattedPhone}`;
    }

    // Carregar configurações
    const config = await loadWhatsAppConfig();
    
    if (!config.accessToken || !config.phoneNumberId) {
      throw new Error('Configurações do WhatsApp incompletas');
    }

    // Construir a URL da API do WhatsApp
    const apiUrl = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

    // Corpo da requisição para a API do WhatsApp
    const requestBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        body: message
      }
    };

    // Enviar a mensagem para a API do WhatsApp
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao enviar mensagem para o WhatsApp');
    }

    // Log de envio (registrar no console em modo dev)
    console.log('[WhatsApp] Mensagem enviada:', {
      phone: formattedPhone,
      messageId: data.messages?.[0]?.id,
      status: 'sent'
    });

    return {
      success: true,
      messageId: data.messages?.[0]?.id
    };
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar mensagem:', error);

    return {
      success: false,
      error: {
        message: (error as Error).message,
      }
    };
  }
};

/**
 * Verifica o status de uma mensagem enviada
 * @param messageId ID da mensagem retornado pela API do WhatsApp
 * @returns Status atual da mensagem
 */
export const checkMessageStatus = async (messageId: string): Promise<string> => {
  try {
    const config = await loadWhatsAppConfig();
    
    if (!config.accessToken || !config.phoneNumberId) {
      throw new Error('Configurações do WhatsApp incompletas');
    }

    const apiUrl = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages/${messageId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao verificar status da mensagem');
    }

    return data.status || 'unknown';
  } catch (error) {
    console.error('Erro ao verificar status da mensagem:', error);
    return 'error';
  }
};