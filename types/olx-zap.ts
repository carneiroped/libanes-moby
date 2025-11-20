/**
 * TIPOS TYPESCRIPT - INTEGRAÇÃO GRUPO OLX/ZAP
 *
 * Documentação oficial:
 * https://developers.grupozap.com/webhooks/integration_leads.html
 */

// =====================================================
// WEBHOOK PAYLOAD TYPES
// =====================================================

/**
 * Payload recebido do webhook do Grupo OLX/ZAP
 */
export interface OlxZapWebhookPayload {
  /** Origem do lead - sempre "Grupo OLX" */
  leadOrigin: 'Grupo OLX';

  /** Data/hora de criação do lead no formato ISO 8601 */
  timestamp: string;

  /** ID único do lead no sistema OLX (usar para deduplicação) */
  originLeadId: string;

  /** ID do anúncio/imóvel no portal OLX/ZAP */
  originListingId: string;

  /** ID do imóvel no CRM (relacionamento com tabela imoveis) */
  clientListingId: string;

  /** Nome do consumidor/lead */
  name: string;

  /** Email do consumidor */
  email: string;

  /** DDD do telefone */
  ddd: string;

  /** Telefone sem DDD */
  phone: string;

  /** Telefone completo com DDD */
  phoneNumber: string;

  /** Mensagem enviada pelo lead */
  message: string;

  /** Temperatura/qualidade do lead: Alta, Média, Baixa */
  temperature: 'Alta' | 'Média' | 'Baixa';

  /** Tipo de transação */
  transactionType: 'SELL' | 'RENT';
}

// =====================================================
// DATABASE TYPES
// =====================================================

/**
 * Configuração de integração OLX/ZAP por conta
 */
export interface OlxZapIntegration {
  id: string;
  account_id: string;

  // Configuração
  is_active: boolean;
  webhook_url: string | null;
  client_api_key: string | null;

  // Estatísticas
  total_leads_received: number;
  last_lead_received_at: string | null;

  // Auditoria
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/**
 * Status de processamento do lead OLX/ZAP
 */
export type OlxZapLeadStatus = 'pending' | 'processed' | 'error' | 'duplicate';

/**
 * Lead recebido do webhook OLX/ZAP
 */
export interface OlxZapLead {
  id: string;
  account_id: string;

  // Dados do webhook
  lead_origin: string;
  timestamp: string;
  origin_lead_id: string;
  origin_listing_id: string | null;
  client_listing_id: string | null;

  // Dados do lead
  name: string;
  email: string | null;
  ddd: string | null;
  phone: string | null;
  phone_number: string | null;
  message: string | null;
  temperature: string | null;
  transaction_type: string | null;

  // Relacionamentos
  lead_id: string | null;
  imovel_id: string | null;

  // Status
  status: OlxZapLeadStatus;
  processing_error: string | null;
  processed_at: string | null;

  // Backup
  raw_payload: Record<string, any> | null;

  // Auditoria
  created_at: string;
  updated_at: string;
}

/**
 * Log de requisição webhook
 */
export interface OlxZapWebhookLog {
  id: string;
  account_id: string | null;

  // Request
  request_method: string | null;
  request_headers: Record<string, any> | null;
  request_body: Record<string, any> | null;
  request_ip: string | null;
  user_agent: string | null;

  // Response
  response_status: number | null;
  response_body: Record<string, any> | null;
  processing_time_ms: number | null;

  // Error
  error_message: string | null;
  error_stack: string | null;

  // Association
  olx_zap_lead_id: string | null;
  origin_lead_id: string | null;

  created_at: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

/**
 * Resposta da API de webhook (retorno para o Grupo OLX)
 */
export interface OlxZapWebhookResponse {
  success: boolean;
  message?: string;
  leadId?: string;
  olxZapLeadId?: string;
  status?: number;
}

/**
 * Configuração de integração para criar/atualizar
 */
export interface OlxZapIntegrationConfig {
  account_id: string;
  is_active: boolean;
  client_api_key?: string;
}

/**
 * Filtros para buscar leads OLX/ZAP
 */
export interface OlxZapLeadFilters {
  account_id: string;
  status?: OlxZapLeadStatus;
  start_date?: string;
  end_date?: string;
  temperature?: string;
  transaction_type?: string;
  page?: number;
  limit?: number;
}

/**
 * Estatísticas da integração
 */
export interface OlxZapStats {
  total_leads: number;
  leads_today: number;
  leads_this_week: number;
  leads_this_month: number;
  by_status: {
    pending: number;
    processed: number;
    error: number;
    duplicate: number;
  };
  by_temperature: {
    alta: number;
    media: number;
    baixa: number;
  };
  by_transaction_type: {
    sell: number;
    rent: number;
  };
}
