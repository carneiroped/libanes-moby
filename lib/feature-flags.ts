// Feature flags para controle de funcionalidades
export const featureFlags = {
  // Flag para usar o novo banco de dados V9
  useNewDatabase: process.env.USE_NEW_DATABASE === 'true' || 
                  process.env.NEXT_PUBLIC_USE_NEW_DATABASE === 'true',
  
  // Flag para habilitar multi-tenancy
  enableMultiTenant: process.env.ENABLE_MULTI_TENANT === 'true' ||
                     process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === 'true',
};

// Helper para verificar se deve usar o novo banco
export function shouldUseNewDatabase(): boolean {
  return featureFlags.useNewDatabase;
}

// Helper para verificar se multi-tenant está habilitado
export function isMultiTenantEnabled(): boolean {
  return featureFlags.enableMultiTenant;
}

// Exemplo de uso:
// import { shouldUseNewDatabase } from '@/lib/feature-flags';
// 
// if (shouldUseNewDatabase()) {
//   // Usar hooks V9 (useProperties, usePipelines, etc)
// } else {
//   // Usar hooks antigos (useImoveis, etc)
// }