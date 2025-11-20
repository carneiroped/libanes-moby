/**
 * Validação automática de ambiente na inicialização
 * Este arquivo é importado pelo app para garantir configuração correta
 */

import { validateEnvironment, printValidationReport } from './env-validation';

// Função para validar apenas uma vez
let validated = false;

export function validateOnStartup() {
  // Evitar validação múltipla
  if (validated || typeof window !== 'undefined') {
    return;
  }
  
  validated = true;
  
  // Executar validação
  const result = validateEnvironment();
  
  // Em desenvolvimento, sempre mostrar relatório se houver problemas
  if (process.env.NODE_ENV === 'development') {
    if (!result.isValid || result.warnings.length > 0) {
      printValidationReport(result);
    }
  }
  
  // Em produção, falhar se houver erros críticos
  if (process.env.NODE_ENV === 'production' && !result.isValid) {
    console.error('❌ ERRO CRÍTICO: Variáveis de ambiente obrigatórias não configuradas!');
    result.errors.forEach(error => console.error(error));
    
    // Em produção, podemos optar por não iniciar a aplicação
    // Descomente a linha abaixo para forçar parada em produção
    // throw new Error('Configuração de ambiente inválida');
  }
  
  return result;
}

// Exportar resultado da validação para uso em outros lugares
export const validationResult = validateOnStartup();