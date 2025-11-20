/**
 * Constantes do sistema RE/MAX
 * Sistema exclusivo - não há multi-tenancy
 */

// ID fixo da conta RE/MAX VIVA I
export const REMAX_ACCOUNT_ID = '284e16f6-2e62-43a1-9997-6a54712d72b1';

// Nome da conta para exibição
export const REMAX_ACCOUNT_NAME = 'RE/MAX VIVA I';

// Configurações padrão do sistema
export const SYSTEM_CONFIG = {
  isMultiTenant: false,
  defaultAccount: REMAX_ACCOUNT_ID,
  systemName: 'Moby CRM - RE/MAX',
  version: '2.0.0-REMAX'
};
