/**
 * Database Schema Types - Generated from actual PostgreSQL/Azure SQL schema
 * These types match the exact database structure
 */

// Enum types from database
export type PropertyType = 
  | 'house'
  | 'apartment'
  | 'commercial'
  | 'land'
  | 'rural'
  | 'condo'
  | 'townhouse'
  | 'penthouse'
  | 'studio'
  | 'loft'
  | 'room'
  | 'garage'
  | 'warehouse'
  | 'office'
  | 'store'
  | 'building'
  | 'hotel'
  | 'farm'
  | 'island'
  | 'other';

export type PropertyPurpose = 'sale' | 'rent' | 'both';
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'rented' | 'unavailable';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiation' | 'converted' | 'lost';
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';
export type AccountPlan = 'trial' | 'starter' | 'professional' | 'enterprise';
export type MessageChannel = 'whatsapp' | 'email' | 'sms' | 'phone' | 'instagram' | 'facebook' | 'webchat';

export type ContractType = 'sale' | 'rent' | 'management' | 'partnership';
export type ContractStatus = 'draft' | 'pending_signatures' | 'active' | 'completed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'archived';

// Main table interfaces
export interface Account {
  id: string;
  slug: string;
  name: string;
  cnpj?: string | null;
  creci?: string | null;
  email: string;
  phone: string;
  whatsapp?: string | null;
  address?: Record<string, any> | null;
  timezone?: string | null;
  plan?: AccountPlan | null;
  max_users?: number | null;
  max_properties?: number | null;
  max_leads_month?: number | null;
  max_ai_credits_month?: number | null;
  current_users?: number | null;
  current_properties?: number | null;
  current_leads_month?: number | null;
  ai_credits_used_month?: number | null;
  settings?: Record<string, any> | null;
  features?: Record<string, any> | null;
  business_hours?: Record<string, any> | null;
  customization?: Record<string, any> | null;
  billing_email?: string | null;
  billing_cycle?: string | null;
  next_billing_date?: Date | string | null;
  is_active?: boolean | null;
  is_verified?: boolean | null;
  trial_ends_at?: Date | string | null;
  cache_version?: number | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
}

export interface User {
  id: string;
  account_id: string;
  email: string;
  name: string;
  phone?: string | null;
  cpf?: string | null;
  creci?: string | null;
  avatar_url?: string | null;
  role?: UserRole | null;
  permissions?: Record<string, any> | null;
  is_active?: boolean | null;
  device_tokens?: string[] | null;
  notification_prefs?: Record<string, any> | null;
  last_activity_at?: Date | string | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
  metadata?: Record<string, any> | null;
}

export interface Property {
  id: string;
  account_id: string;
  code: string;
  title: string;
  description?: string | null;
  type: PropertyType;
  purpose?: PropertyPurpose | null;
  status?: PropertyStatus | null;
  address: Record<string, any>;
  location?: any | null;
  latitude?: number | null;
  longitude?: number | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  total_area?: number | null;
  built_area?: number | null;
  land_area?: number | null;
  bedrooms?: number | null;
  suites?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  floor?: number | null;
  features?: Record<string, any> | null;
  amenities?: Record<string, any> | null;
  sale_price?: number | null;
  rent_price?: number | null;
  condo_fee?: number | null;
  iptu?: number | null;
  suggested_price?: number | null;
  price_confidence?: number | null;
  owner_name?: string | null;
  owner_phone?: string | null;
  owner_email?: string | null;
  commission?: number | null;
  images?: any[] | null;
  videos?: any[] | null;
  virtual_tour_url?: string | null;
  marketing_texts?: Record<string, any> | null;
  target_audience?: Record<string, any> | null;
  view_count?: number | null;
  favorite_count?: number | null;
  inquiry_count?: number | null;
  conversion_rate?: number | null;
  slug?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  site?: string | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
  published_at?: Date | string | null;
  sold_at?: Date | string | null;
  pricing_options?: Record<string, any> | null;
  search_embeddings?: Record<string, any> | null;
  // Campos específicos Seehaus
  frente?: number | null;
  direita?: number | null;
  esquerda?: number | null;
  fundos?: number | null;
  entrada_72x?: number | null;
  parcela_72x?: number | null;
  total_72x?: number | null;
  entrada_25_75?: number | null;
  parcela_24x?: number | null;
  saldo_final_75?: number | null;
  total_25_75?: number | null;
}

export interface Lead {
  id: string;
  account_id: string;
  assignee_id?: string | null;
  name: string;
  email?: string | null;
  phone: string;
  whatsapp?: string | null;
  cpf_cnpj?: string | null;
  birth_date?: Date | string | null;
  profession?: string | null;
  company?: string | null;
  income_range?: string | null;
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  status?: LeadStatus | null;
  pipeline_id?: string | null;
  stage_id?: string | null;
  temperature?: string | null;
  source?: string | null;
  source_details?: Record<string, any> | null;
  utm_data?: Record<string, any> | null;
  property_types?: PropertyType[] | null;
  budget_min?: number | null;
  budget_max?: number | null;
  desired_features?: Record<string, any> | null;
  desired_locations?: Record<string, any> | null;
  score?: number | null;
  ai_score?: number | null;
  ai_profile?: Record<string, any> | null;
  scoring_factors?: Record<string, any> | null;
  conversion_probability?: number | null;
  preferred_channel?: MessageChannel | null;
  best_contact_time?: string[] | null;
  do_not_disturb?: boolean | null;
  total_interactions?: number | null;
  last_contact_at?: Date | string | null;
  last_activity_at?: Date | string | null;
  tags?: string[] | null;
  notes?: string | null;
  custom_fields?: Record<string, any> | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
  converted_at?: Date | string | null;
  metadata?: Record<string, any> | null;
  encrypted_cpf?: Record<string, any> | null;
  cpf_search_prefix?: string | null;
  encrypted_cnpj?: Record<string, any> | null;
  cnpj_search_prefix?: string | null;
}

export interface Contract {
  id: string;
  account_id: string;
  contract_number: string;
  template_id?: string | null;
  type: ContractType;
  status: ContractStatus;
  lead_id: string;
  property_id: string;
  agent_id: string;
  total_value: number;
  down_payment?: number | null;
  installments?: number | null;
  installment_value?: number | null;
  commission_percent: number;
  commission_value: number;
  commission_split?: Record<string, any> | null;
  signature_date?: Date | string | null;
  start_date: Date | string;
  end_date?: Date | string | null;
  document_data?: Record<string, any>;
  clauses?: Record<string, any>;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Task {
  id: string;
  account_id: string;
  owner_id: string;
  title: string;
  description?: string | null;
  priority?: TaskPriority | null;
  lead_id?: string | null;
  contract_id?: string | null;
  due_date?: Date | string | null;
  completed_at?: Date | string | null;
  status?: TaskStatus | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Pipeline {
  id: string;
  account_id: string;
  name: string;
  is_default?: boolean | null;
  is_active?: boolean | null;
  automations?: Record<string, any> | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  order: number;
  color?: string | null;
  automations?: Record<string, any> | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
}

export interface ContractTemplate {
  id: string;
  account_id: string;
  name: string;
  type: ContractType;
  sections?: Record<string, any>;
  clauses?: Record<string, any>;
  variables?: Record<string, any>;
  is_default?: boolean | null;
  is_active?: boolean | null;
  legal_review?: boolean | null;
  reviewed_by?: string | null;
  reviewed_at?: Date | string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Insert/Update types (without id and timestamps)
export type AccountInsert = Omit<Account, 'id' | 'created_at' | 'updated_at'>;
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type PropertyInsert = Omit<Property, 'id' | 'created_at' | 'updated_at'>;
export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
export type ContractInsert = Omit<Contract, 'id' | 'created_at' | 'updated_at'>;
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type PipelineInsert = Omit<Pipeline, 'id' | 'created_at' | 'updated_at'>;
export type PipelineStageInsert = Omit<PipelineStage, 'id' | 'created_at' | 'updated_at'>;
export type ContractTemplateInsert = Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>;

// Update types (all fields optional except id)
export type AccountUpdate = Partial<AccountInsert>;
export type UserUpdate = Partial<UserInsert>;
export type PropertyUpdate = Partial<PropertyInsert>;
export type LeadUpdate = Partial<LeadInsert>;
export type ContractUpdate = Partial<ContractInsert>;
export type TaskUpdate = Partial<TaskInsert>;
export type PipelineUpdate = Partial<PipelineInsert>;
export type PipelineStageUpdate = Partial<PipelineStageInsert>;
export type ContractTemplateUpdate = Partial<ContractTemplateInsert>;