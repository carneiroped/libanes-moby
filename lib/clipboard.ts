/**
 * Clipboard utilities for copying data to clipboard
 */

import { toast } from 'sonner';

export const copyToClipboard = async (text: string, successMessage?: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Use modern clipboard API
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        throw new Error('Fallback copy failed');
      }
    }
    
    toast.success(successMessage || 'Copiado para a área de transferência!');
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    toast.error('Erro ao copiar para área de transferência');
    return false;
  }
};

export const copyLeadData = async (lead: any): Promise<boolean> => {
  const leadData = `
Nome: ${lead.name}
Telefone: ${lead.phone}
Email: ${lead.email || 'Não informado'}
Status: ${lead.status}
Score IA: ${lead.ai_score || 0}/100
Probabilidade de conversão: ${lead.conversion_probability ? Math.round(lead.conversion_probability * 100) : 0}%
Criado em: ${new Date(lead.created_at).toLocaleDateString('pt-BR')}
  `.trim();
  
  return await copyToClipboard(leadData, 'Dados do lead copiados!');
};

export const copyPropertyData = async (property: any): Promise<boolean> => {
  const propertyData = `
Código: ${property.code}
Título: ${property.title}
Preço: ${property.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price) : 'N/A'}
Preço Sugerido: ${property.ai_suggested_price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.ai_suggested_price) : 'N/A'}
Tipo: ${property.type}
Finalidade: ${property.purpose}
Bairro: ${property.neighborhood || 'Não informado'}
Status: ${property.status}
  `.trim();
  
  return await copyToClipboard(propertyData, 'Dados do imóvel copiados!');
};

export const copyAutomationData = async (automation: any): Promise<boolean> => {
  const automationData = `
Nome: ${automation.name}
Descrição: ${automation.description || 'Sem descrição'}
Status: ${automation.is_active ? 'Ativa' : 'Inativa'}
Execuções: ${automation.execution_count || 0}
Taxa de sucesso: ${automation.success_rate || 0}%
Última execução: ${automation.last_executed_at ? new Date(automation.last_executed_at).toLocaleString('pt-BR') : 'Nunca'}
Criada em: ${new Date(automation.created_at).toLocaleDateString('pt-BR')}
  `.trim();
  
  return await copyToClipboard(automationData, 'Dados da automação copiados!');
};

export const copyMetricsData = async (metrics: any): Promise<boolean> => {
  const metricsData = `
MÉTRICAS DE IA - ${new Date().toLocaleDateString('pt-BR')}

Automações Ativas: ${metrics.active_automations || 0}
Total de Automações: ${metrics.total_automations || 0}
Execuções Hoje: ${metrics.executions_today || 0}
Execuções Este Mês: ${metrics.executions_this_month || 0}
Taxa de Sucesso: ${metrics.success_rate || 0}%
Tempo Economizado: ${metrics.time_saved_hours || 0}h
  `.trim();
  
  return await copyToClipboard(metricsData, 'Métricas copiadas!');
};