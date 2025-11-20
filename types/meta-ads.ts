/**
 * TIPOS - INTEGRAÇÃO META ADS
 *
 * Tipos TypeScript para integração com Meta Ads (Facebook/Instagram Lead Forms)
 */

export interface MetaAdsIntegration {
  id: string;
  account_id: string;

  // API Configuration
  app_id?: string | null;
  app_secret?: string | null;
  access_token?: string | null;
  page_id?: string | null;

  // Instagram (optional)
  instagram_account_id?: string | null;

  // Lead Forms
  form_id?: string | null;

  // Webhook
  webhook_url: string;
  webhook_secret: string;
  verify_token: string;

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

export interface MetaAdsLead {
  id: string;
  integration_id: string;
  account_id: string;
  lead_id?: string | null;

  // Meta Data
  leadgen_id?: string | null;
  platform?: string | null; // 'facebook' or 'instagram'
  form_id?: string | null;
  form_name?: string | null;
  campaign_id?: string | null;
  campaign_name?: string | null;
  ad_id?: string | null;
  ad_name?: string | null;
  adset_id?: string | null;
  adset_name?: string | null;

  // Lead Data
  name?: string | null;
  email?: string | null;
  phone?: string | null;

  // Custom Form Fields
  form_data?: Record<string, any>;

  // Metadata
  page_id?: string | null;
  created_time?: string | null;
  utm_source?: string;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;

  // Status
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  processed_at?: string | null;

  created_at: string;
  updated_at: string;
}

export interface MetaAdsWebhookLog {
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

export interface MetaAdsStats {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  qualified_leads: number;
  converted_leads: number;
  lost_leads: number;
  conversion_rate: number;
  facebook_leads: number;
  instagram_leads: number;
  last_7_days: number;
  last_30_days: number;
}

export interface MetaAdsIntegrationConfig {
  accountId: string;
  appId?: string;
  appSecret?: string;
  accessToken?: string;
  pageId?: string;
  instagramAccountId?: string;
  formId?: string;
  verifyToken?: string;
  isActive?: boolean;
}

// Webhook payload types
export interface MetaLeadgenFormData {
  field_key: string;
  values: string[];
}

export interface MetaLeadgenData {
  id: string;
  ad_id: string;
  form_id: string;
  field_data: MetaLeadgenFormData[];
  created_time: string;
  is_organic?: boolean;
  platform?: string;
}

export interface MetaWebhookEntry {
  id: string;
  time: number;
  changes: Array<{
    field: string;
    value: {
      ad_id?: string;
      adgroup_id?: string;
      campaign_id?: string;
      form_id?: string;
      leadgen_id?: string;
      created_time?: number;
      page_id?: string;
      platform?: string;
    };
  }>;
}

export interface MetaWebhookPayload {
  object: 'page' | 'instagram' | 'leadgen';
  entry: MetaWebhookEntry[];
}

// Facebook Graph API response types
export interface FacebookLeadFormData {
  id: string;
  created_time: string;
  ad_id?: string;
  adgroup_id?: string;
  campaign_id?: string;
  form_id: string;
  field_data: Array<{
    name: string;
    values: string[];
  }>;
  is_organic: boolean;
  platform: 'facebook' | 'instagram';
}

export interface FacebookFormDetails {
  id: string;
  name: string;
  status: string;
  leads_count: number;
  locale: string;
  privacy_policy_url?: string;
  questions: Array<{
    key: string;
    label: string;
    type: string;
    options?: string[];
  }>;
  created_time: string;
}

export interface InstagramLeadFormData extends FacebookLeadFormData {
  platform: 'instagram';
}
