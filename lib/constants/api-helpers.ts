import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { REMAX_ACCOUNT_ID } from '@/lib/constants/remax';

/**
 * Helper para APIs do sistema RE/MAX
 * Sempre usa o account_id fixo da RE/MAX
 */

export function getRemaxAccountId(): string {
  return REMAX_ACCOUNT_ID;
}

export function createRemaxSupabaseClient() {
  return createServiceRoleClient();
}

/**
 * Adiciona filtro de account_id da RE/MAX em queries
 */
export function withRemaxAccount(query: any) {
  return query.eq('account_id', REMAX_ACCOUNT_ID);
}

/**
 * Dados padrão para inserções com account_id da RE/MAX
 */
export function withRemaxAccountData<T extends Record<string, any>>(data: T): T & { account_id: string } {
  return {
    ...data,
    account_id: REMAX_ACCOUNT_ID
  };
}
