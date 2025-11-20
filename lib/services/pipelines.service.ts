/**
 * Pipelines Service - Enum-Based Model
 * Usa modelo fixo de pipeline definido em /lib/config/pipeline-stages.ts
 * Não depende mais de tabelas pipelines/pipeline_stages
 */

import { PIPELINE_STAGES, type LeadStage, type PipelineStage as ConfigPipelineStage } from '@/lib/config/pipeline-stages'
import { supabase, getUserAccountId } from '@/lib/supabase/client'

// Export types para compatibilidade
export interface Pipeline {
  id: string
  name: string
  type: 'leads' | 'deals' | 'support'
  stages: PipelineStage[]
  created_at: string
  updated_at: string
}

export interface PipelineStage {
  id: string
  name: string
  order: number
  color: string
  pipeline_id: string
  probability?: number
  created_at: string
  updated_at: string
}

export interface PipelineCard {
  id: string
  title: string
  stage_id: string
  pipeline_id: string
  assignee_id?: string
  value?: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface PipelineStats {
  total_cards: number
  total_value: number
  average_time_in_stage: number
  conversion_rate: number
  cards_by_stage: Record<string, number>
  value_by_stage: Record<string, number>
}

class PipelinesService {
  /**
   * Get all pipelines
   * NOTA: Retorna pipeline fixo baseado em enum
   */
  async getPipelines(): Promise<Pipeline[]> {
    const accountId = await getUserAccountId()
    if (!accountId) throw new Error('Account ID not found')

    // Retornar pipeline fixo baseado em PIPELINE_STAGES
    const now = new Date().toISOString()

    return [{
      id: 'default-leads-pipeline',
      name: 'Pipeline de Vendas',
      type: 'leads' as const,
      stages: PIPELINE_STAGES.map(stage => ({
        id: stage.id,
        name: stage.name,
        order: stage.order,
        color: stage.color,
        pipeline_id: 'default-leads-pipeline',
        probability: stage.order * 15, // Estimativa baseada no estágio
        created_at: now,
        updated_at: now,
      })),
      created_at: now,
      updated_at: now,
    }]
  }

  /**
   * Get pipeline by ID
   */
  async getPipelineById(pipelineId: string): Promise<Pipeline | null> {
    const pipelines = await this.getPipelines()
    return pipelines.find(p => p.id === pipelineId) || null
  }

  /**
   * Get pipeline stages
   * NOTA: Retorna estágios fixos baseados em enum
   */
  async getPipelineStages(pipelineId: string): Promise<PipelineStage[]> {
    const pipeline = await this.getPipelineById(pipelineId)
    return pipeline?.stages || []
  }

  /**
   * Get pipeline cards (leads)
   * Busca leads do banco agrupados por estágio
   */
  async getPipelineCards(pipelineId: string): Promise<PipelineCard[]> {
    const accountId = await getUserAccountId()
    if (!accountId) return []

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })

    if (!leads) return []

    return leads.map(lead => ({
      id: lead.id,
      title: lead.name,
      stage_id: lead.stage || 'lead_novo',
      pipeline_id: pipelineId,
      assignee_id: lead.assigned_to || undefined,
      value: lead.budget_max || undefined,
      priority: 'medium' as const,
      tags: lead.tags || [],
      created_at: lead.created_at || new Date().toISOString(),
      updated_at: lead.updated_at || new Date().toISOString(),
    }))
  }

  /**
   * Move card to another stage
   */
  async moveCard(cardId: string, targetStageId: string): Promise<boolean> {
    const accountId = await getUserAccountId()
    if (!accountId) return false

    const { error } = await supabase
      .from('leads')
      .update({ stage: targetStageId as LeadStage })
      .eq('id', cardId)
      .eq('account_id', accountId)

    return !error
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(pipelineId: string): Promise<PipelineStats> {
    const accountId = await getUserAccountId()
    if (!accountId) {
      return {
        total_cards: 0,
        total_value: 0,
        average_time_in_stage: 0,
        conversion_rate: 0,
        cards_by_stage: {},
        value_by_stage: {},
      }
    }

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('account_id', accountId)

    if (!leads || leads.length === 0) {
      return {
        total_cards: 0,
        total_value: 0,
        average_time_in_stage: 0,
        conversion_rate: 0,
        cards_by_stage: {},
        value_by_stage: {},
      }
    }

    const cards_by_stage: Record<string, number> = {}
    const value_by_stage: Record<string, number> = {}
    let total_value = 0

    leads.forEach(lead => {
      const stage = lead.stage || 'lead_novo'
      cards_by_stage[stage] = (cards_by_stage[stage] || 0) + 1

      const value = lead.budget_max || 0
      value_by_stage[stage] = (value_by_stage[stage] || 0) + value
      total_value += value
    })

    const convertedLeads = leads.filter(l => l.status === 'convertido')
    const conversion_rate = leads.length > 0
      ? (convertedLeads.length / leads.length) * 100
      : 0

    return {
      total_cards: leads.length,
      total_value,
      average_time_in_stage: 0, // Calcularia com histórico de mudanças
      conversion_rate,
      cards_by_stage,
      value_by_stage,
    }
  }

  /**
   * Create pipeline
   * NOTA: Não cria mais pipelines no banco, retorna pipeline fixo
   */
  async createPipeline(name: string, type: 'leads' | 'deals' | 'support'): Promise<Pipeline> {
    const pipelines = await this.getPipelines()
    return pipelines[0] // Sempre retorna o pipeline padrão
  }

  /**
   * Update pipeline
   * NOTA: Não atualiza mais pipelines (são fixos), retorna sucesso
   */
  async updatePipeline(pipelineId: string, data: Partial<Pipeline>): Promise<boolean> {
    return true // Pipeline é fixo, não permite edição
  }

  /**
   * Delete pipeline
   * NOTA: Não deleta pipelines (são fixos), retorna erro
   */
  async deletePipeline(pipelineId: string): Promise<boolean> {
    return false // Pipeline é fixo, não permite deleção
  }

  /**
   * Update stage
   * NOTA: Não atualiza estágios (são fixos), retorna sucesso
   */
  async updateStage(stageId: string, data: Partial<PipelineStage>): Promise<boolean> {
    return true // Estágios são fixos, não permite edição
  }
}

export const pipelinesService = new PipelinesService()
