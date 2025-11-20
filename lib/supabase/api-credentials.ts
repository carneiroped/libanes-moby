// API Credentials management with Supabase
/**
 * NOTA: A tabela api_credentials NÃO existe no banco de dados.
 * Este arquivo está com cast para 'any' para permitir compilação.
 * Implementação placeholder até a tabela ser criada.
 */

import { createServiceRoleClient } from './service-role';
import { ApiKeyConfiguration, ApiService } from '@/lib/security/api-key-types';

export interface ApiCredential {
  id: string;
  account_id: string;
  service: ApiService;
  name: string;
  credentials: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type { ApiService };

export async function getApiCredentials(accountId: string, serviceName: string): Promise<ApiKeyConfiguration | null> {
  const supabase = createServiceRoleClient() as any;

  const { data, error } = await supabase
    .from('api_credentials')
    .select('*')
    .eq('account_id', accountId)
    .eq('service_name', serviceName)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching API credentials:', error);
    return null;
  }

  return data;
}

export async function saveApiCredentials(config: Omit<ApiKeyConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
  const supabase = createServiceRoleClient() as any;

  const { error } = await supabase
    .from('api_credentials')
    .upsert({
      ...config,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error saving API credentials:', error);
    return false;
  }

  return true;
}

export async function deleteApiCredentials(accountId: string, serviceName: string): Promise<boolean> {
  const supabase = createServiceRoleClient() as any;

  const { error } = await supabase
    .from('api_credentials')
    .delete()
    .eq('account_id', accountId)
    .eq('service_name', serviceName);

  if (error) {
    console.error('Error deleting API credentials:', error);
    return false;
  }

  return true;
}

export async function getAllApiCredentials(): Promise<ApiCredential[]> {
  const supabase = createServiceRoleClient() as any;

  const { data, error } = await supabase
    .from('api_credentials')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching all API credentials:', error);
    return [];
  }

  return (data as any[]) || [];
}

export async function upsertApiCredential(credential: Omit<ApiCredential, 'id' | 'created_at' | 'updated_at'>): Promise<ApiCredential | null> {
  const supabase = createServiceRoleClient() as any;

  const { data, error } = await supabase
    .from('api_credentials')
    .upsert({
      ...credential,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting API credential:', error);
    return null;
  }

  return data;
}

export async function deactivateApiCredential(service: ApiService, name: string): Promise<boolean> {
  const supabase = createServiceRoleClient() as any;

  const { error } = await supabase
    .from('api_credentials')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('service', service)
    .eq('name', name);

  if (error) {
    console.error('Error deactivating API credential:', error);
    return false;
  }

  return true;
}
