/**
 * CONFIGURAÇÃO FIXA - Estágios do Pipeline Imobiliário
 *
 * Sistema simplificado: estágios fixos diretamente na coluna 'stage' da tabela leads (ENUM)
 * Não há mais tabelas pipelines ou pipeline_stages.
 */

export type LeadStage =
  | 'lead_novo'
  | 'qualificacao'
  | 'apresentacao'
  | 'visita_agendada'
  | 'proposta'
  | 'documentacao'
  | 'fechamento';

export interface PipelineStage {
  id: LeadStage;
  name: string;
  description: string;
  color: string;
  order: number;
  icon?: string;
}

/**
 * Estágios fixos do funil de vendas imobiliárias
 * Ordem otimizada para conversão
 */
export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'lead_novo',
    name: 'Lead Novo',
    description: 'Primeiro contato com o lead - captura inicial',
    color: '#3b82f6', // Azul
    order: 1,
    icon: '📥',
  },
  {
    id: 'qualificacao',
    name: 'Qualificação',
    description: 'Verificação de perfil, orçamento e necessidades',
    color: '#8b5cf6', // Roxo
    order: 2,
    icon: '🎯',
  },
  {
    id: 'apresentacao',
    name: 'Apresentação',
    description: 'Apresentação de opções de imóveis compatíveis',
    color: '#f97316', // Laranja
    order: 3,
    icon: '🏠',
  },
  {
    id: 'visita_agendada',
    name: 'Visita Agendada',
    description: 'Lead agendou visita presencial ao imóvel',
    color: '#eab308', // Amarelo
    order: 4,
    icon: '📅',
  },
  {
    id: 'proposta',
    name: 'Proposta',
    description: 'Negociação de valores e condições',
    color: '#22c55e', // Verde claro
    order: 5,
    icon: '💰',
  },
  {
    id: 'documentacao',
    name: 'Documentação',
    description: 'Análise de crédito, documentos e aprovações',
    color: '#0ea5e9', // Azul escuro
    order: 6,
    icon: '📄',
  },
  {
    id: 'fechamento',
    name: 'Fechamento',
    description: 'Contrato assinado - venda concluída',
    color: '#059669', // Verde escuro
    order: 7,
    icon: '✅',
  },
];

/**
 * Obter estágio por ID
 */
export function getStageById(stageId: LeadStage): PipelineStage | undefined {
  return PIPELINE_STAGES.find(s => s.id === stageId);
}

/**
 * Obter próximo estágio (para automações)
 */
export function getNextStage(currentStage: LeadStage): PipelineStage | null {
  const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === currentStage);
  if (currentIndex === -1 || currentIndex === PIPELINE_STAGES.length - 1) {
    return null; // Não encontrado ou já no último estágio
  }
  return PIPELINE_STAGES[currentIndex + 1];
}

/**
 * Obter estágio anterior (para rollback)
 */
export function getPreviousStage(currentStage: LeadStage): PipelineStage | null {
  const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === currentStage);
  if (currentIndex <= 0) {
    return null; // Não encontrado ou já no primeiro estágio
  }
  return PIPELINE_STAGES[currentIndex - 1];
}

/**
 * Verificar se é estágio final (fechamento)
 */
export function isFinalStage(stage: LeadStage): boolean {
  return stage === 'fechamento';
}

/**
 * Verificar se é estágio crítico (visita agendada)
 */
export function isCriticalStage(stage: LeadStage): boolean {
  return stage === 'visita_agendada';
}

/**
 * Obter cor do estágio
 */
export function getStageColor(stage: LeadStage): string {
  return getStageById(stage)?.color || '#6b7280';
}

/**
 * Obter nome do estágio
 */
export function getStageName(stage: LeadStage): string {
  return getStageById(stage)?.name || stage;
}
