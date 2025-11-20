/**
 * TIPOS - INTEGRAÇÃO GOOGLE ADS
 *
 * Tipos TypeScript para integração com Google Ads Lead Forms
 */

export interface GoogleAdsIntegration {
  id: string;
  account_id: string;

  // API Configuration
  customer_id?: string | null;
  developer_token?: string | null;
  client_id?: string | null;
  client_secret?: string | null;
  refresh_token?: string | null;

  // Lead Forms Configuration
  conversion_action_id?: string | null;

  // Webhook
  webhook_url: string;
  webhook_secret: string;

  // Status & Metrics
  is_active: boolean;
  last_sync_at?: string | null;
  total_leads_received: number;
  total_leads_converted: number;

  // Metadata
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GoogleAdsLead {
  id: string;
  integration_id: string;
  account_id: string;
  lead_id?: string | null;

  // Google Ads Data
  gclid?: string | null;
  campaign_id?: string | null;
  campaign_name?: string | null;
  ad_group_id?: string | null;
  ad_group_name?: string | null;
  ad_id?: string | null;
  keyword?: string | null;

  // Lead Data
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;

  // Conversion Data
  conversion_date?: string | null;
  conversion_value?: number | null;

  // Custom Form Fields
  form_data?: Record<string, any>;

  // Metadata
  source_url?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  utm_source?: string;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;

  // Status
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  processed_at?: string | null;

  created_at: string;
  updated_at: string;
}

export interface GoogleAdsWebhookLog {
  id: string;
  integration_id?: string | null;
  account_id: string;

  // Request
  method: string;
  headers?: Record<string, any>;
  body?: Record<string, any>;
  query_params?: Record<string, any>;

  // Response
  status_code?: number | null;
  response_body?: Record<string, any>;

  // Processing
  processed: boolean;
  error_message?: string | null;

  created_at: string;
}

export interface GoogleAdsStats {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  qualified_leads: number;
  converted_leads: number;
  lost_leads: number;
  conversion_rate: number;
  avg_conversion_value: number;
  last_7_days: number;
  last_30_days: number;
}

export interface GoogleAdsIntegrationConfig {
  accountId: string;
  customerId?: string;
  developerToken?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  conversionActionId?: string;
  isActive?: boolean;
}

// Webhook payload types
export interface GoogleAdsLeadFormSubmission {
  gclid: string;
  campaign_id: string;
  ad_group_id: string;
  creative_id: string;
  user_column_data: Array<{
    column_id: string;
    string_value?: string;
    boolean_value?: boolean;
    phone_number_value?: string;
    postal_address_value?: {
      revision_id: number;
      granularity: string;
      recipient_name?: string;
      street_address?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  }>;
  lead_form_user_details?: {
    user_agent?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  api_version: string;
}

export interface GoogleAdsWebhookPayload {
  conversion_action: string;
  conversion_date_time: string;
  conversion_value?: number;
  gclid?: string;
  order_id?: string;
  external_attribution_data?: {
    external_attribution_credit?: number;
    external_attribution_model?: string;
  };
  custom_variables?: Array<{
    key: string;
    value: string;
  }>;
}
