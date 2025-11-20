// API Key types

export interface ApiKey {
  id: string;
  account_id: string;
  name: string;
  key: string;
  key_prefix: string;
  scopes: string[];
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyConfiguration {
  id: string;
  account_id: string;
  service_name: string;
  api_key: string;
  api_secret?: string;
  endpoint_url?: string;
  additional_config?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes: string[];
  expires_in_days?: number;
}

export interface RotateApiKeyRequest {
  key_id: string;
}

export interface RevokeApiKeyRequest {
  key_id: string;
}

export type ApiService =
  | 'whatsapp'
  | 'openai'
  | 'azure'
  | 'sendgrid'
  | 'twilio'
  | 'google'
  | 'facebook'
  | string;

export interface ApiConfiguration {
  id: string;
  account_id: string;
  service_name: ApiService;
  api_key_encrypted: string | null;
  settings?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
