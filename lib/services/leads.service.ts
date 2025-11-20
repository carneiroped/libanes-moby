/**
 * Leads Service - Supabase Real Database
 * Handles all lead-related operations with real Supabase database
 */

import { supabase, getUserAccountId } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Database types
type DbLead = Database['public']['Tables']['leads']['Row']
type DbLeadInsert = Database['public']['Tables']['leads']['Insert']
type DbLeadUpdate = Database['public']['Tables']['leads']['Update']
// type DbPipelineStage = Database['public']['Tables']['pipeline_stages']['Row'] // Commented until table exists
type DbUser = Database['public']['Tables']['users']['Row']

// Export types for compatibility
export interface Lead {
  id: string
  account_id: string
  name: string
  email: string | null
  phone: string | null
  source: string | null
  status: string
  stage: string // Novo: enum de estágios
  assigned_to: string | null
  score: number
  budget_min: number | null
  budget_max: number | null
  notes: string | null
  tags: string[]
  last_contact: string | null
  created_at: string
  updated_at: string
  // Extended fields
  cpf?: string | null
  company?: string | null
  city?: string | null
  state?: string | null
  property_preferences?: any
}

export interface LeadWithStage extends Lead {
  stage_name?: string | null
  stage_color?: string | null
  assigned_user_name?: string | null
  contact_name?: string | null
  phone_number?: string | null
  interest_level?: 'baixo' | 'médio' | 'alto' | 'muito_alto'
  lead_source?: string | null
  preferred_areas?: string[] | null
  property_type?: string[] | null
  bedrooms?: number | null
  last_contact_date?: string | null
  last_contact_at?: string | null
  assignee_id?: string | null
  stage_id?: string | null
  chat_id?: string | null
}

export interface LeadFilters {
  stage_id?: string
  pipeline_id?: string
  assigned_to?: string | null
  search?: string
  interest_level?: 'baixo' | 'médio' | 'alto' | 'muito_alto'
  status?: string
  page?: number
  pageSize?: number
  score_min?: number
  score_max?: number
  created_from?: string
  created_to?: string
  source?: string
}

export interface LeadsResponse {
  leads: LeadWithStage[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LeadActivity {
  id: string
  lead_id: string | null
  type: string  // Não activity_type
  title?: string
  description: string | null
  created_at: string | null
  user_id?: string | null  // Não created_by
  metadata?: any
  outcome?: string | null
  duration_minutes?: number | null
}

export interface LeadNote {
  id: string
  lead_id: string
  content: string
  created_at: string
  created_by: string
  is_private?: boolean
}

export interface LeadTimeline {
  activities: LeadActivity[]
  notes: LeadNote[]
}

/**
 * Leads Service Class
 */
class LeadsService {
  /**
   * Get all leads with filters and pagination
   */
  async getLeads(filters: LeadFilters = {}): Promise<LeadsResponse> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated or no account found')
      }

      const {
        stage_id,
        pipeline_id,
        assigned_to,
        search,
        interest_level,
        status,
        page = 1,
        pageSize = 20,
        score_min,
        score_max,
        created_from,
        created_to,
        source
      } = filters

      // Build query - simplificada sem joins para debug
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('account_id', accountId)

      // Apply filters
      if (stage_id && stage_id !== 'all') {
        query = query.eq('stage', stage_id as any)  // Cast necessário pois stage_id pode ser string genérico
      }

      // Pipeline_id não é mais usado - ignorar
      // if (pipeline_id) {
      //   query = query.eq('pipeline_stages.pipeline_id', pipeline_id)
      // }

      if (assigned_to && assigned_to !== 'all') {
        query = query.eq('assigned_to', assigned_to)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (source) {
        query = query.eq('source', source)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      }

      // Score/interest level filter
      if (interest_level) {
        const scoreMap: Record<string, { min: number; max: number }> = {
          'baixo': { min: 0, max: 25 },
          'médio': { min: 26, max: 50 },
          'alto': { min: 51, max: 75 },
          'muito_alto': { min: 76, max: 100 }
        }
        const range = scoreMap[interest_level]
        if (range) {
          query = query.gte('score', range.min).lte('score', range.max)
        }
      }

      if (score_min !== undefined) {
        query = query.gte('score', score_min)
      }

      if (score_max !== undefined) {
        query = query.lte('score', score_max)
      }

      // Date filters
      if (created_from) {
        query = query.gte('created_at', created_from)
      }

      if (created_to) {
        query = query.lte('created_at', created_to)
      }

      // Pagination
      const offset = (page - 1) * pageSize
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('[LeadsService] Error fetching leads:', error)
        throw error
      }

      // Map to LeadWithStage
      const leads: LeadWithStage[] = (data || []).map(lead => this.mapLeadWithStage(lead))

      return {
        leads,
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    } catch (error) {
      console.error('[LeadsService] Error in getLeads:', error)
      return {
        leads: [],
        count: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      }
    }
  }

  /**
   * Get a single lead by ID
   */
  async getLead(leadId: string): Promise<LeadWithStage | null> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('account_id', accountId)
        .single()

      if (error) {
        console.error('[LeadsService] Error fetching lead:', error)
        return null
      }

      return this.mapLeadWithStage(data)
    } catch (error) {
      console.error('[LeadsService] Error in getLead:', error)
      return null
    }
  }

  /**
   * Create a new lead
   */
  async createLead(leadData: Partial<DbLeadInsert>): Promise<Lead> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      // Validar campos obrigatórios
      if (!leadData.name) {
        throw new Error('Name is required')
      }

      if (!leadData.phone) {
        throw new Error('Phone is required')
      }

      const { data, error } = await (supabase
        .from('leads') as any)
        .insert({
          account_id: accountId,
          name: leadData.name,
          email: leadData.email || null,
          phone: leadData.phone,
          source: leadData.source || 'website',
          status: leadData.status || 'novo',
          stage: (leadData as any).stage || 'lead_novo', // Stage padrão válido
          assigned_to: leadData.assigned_to || null,
          score: leadData.score !== undefined ? leadData.score : 50,
          budget_min: leadData.budget_min || null,
          budget_max: leadData.budget_max || null,
          notes: leadData.notes || null,
          tags: leadData.tags || [],
          cpf: leadData.cpf || null,
          company: leadData.company || null,
          city: leadData.city || null,
          state: leadData.state || null,
          property_preferences: leadData.property_preferences || null
        })
        .select()
        .single()

      if (error) {
        console.error('[LeadsService] Error creating lead:', error)
        throw error
      }

      console.log('[LeadsService] Lead created successfully:', data)

      return data as Lead
    } catch (error) {
      console.error('[LeadsService] Error in createLead:', error)
      throw error
    }
  }

  /**
   * Update a lead
   */
  async updateLead(leadId: string, updates: Partial<DbLeadUpdate>): Promise<Lead> {
    try {
      console.log('🔄 [LeadsService] updateLead called with:', { leadId, updates })

      const accountId = await getUserAccountId()
      console.log('🔑 [LeadsService] accountId:', accountId)

      if (!accountId) {
        throw new Error('User not authenticated')
      }

      console.log('📤 [LeadsService] Sending update to Supabase...')
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .eq('account_id', accountId)
        .select()
        .single()

      if (error) {
        console.error('❌ [LeadsService] Supabase error:', error)
        throw error
      }

      console.log('✅ [LeadsService] Lead updated successfully:', data)
      return data as Lead
    } catch (error) {
      console.error('❌ [LeadsService] Error in updateLead:', error)
      throw error
    }
  }

  /**
   * Delete a lead
   */
  async deleteLead(leadId: string): Promise<void> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
        .eq('account_id', accountId)

      if (error) {
        console.error('[LeadsService] Error deleting lead:', error)
        throw error
      }
    } catch (error) {
      console.error('[LeadsService] Error in deleteLead:', error)
      throw error
    }
  }

  /**
   * Update lead stage (usa coluna stage ENUM)
   */
  async updateLeadStage(leadId: string, stageId: string): Promise<Lead> {
    return this.updateLead(leadId, { stage: stageId as any })
  }

  /**
   * Add activity to lead
   */
  async addActivity(leadId: string, activity: {
    type: string
    description: string
    metadata?: any
  }): Promise<LeadActivity> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data: user } = await supabase.auth.getUser()

      const { data, error} = await (supabase
        .from('activities') as any)
        .insert({
          account_id: accountId,
          lead_id: leadId,
          type: activity.type,
          description: activity.description,
          metadata: activity.metadata,
          user_id: user.user?.id
        })
        .select()
        .single()

      if (error) {
        console.error('[LeadsService] Error adding activity:', error)
        throw error
      }

      return data as LeadActivity
    } catch (error) {
      console.error('[LeadsService] Error in addActivity:', error)
      throw error
    }
  }

  /**
   * Get lead timeline (activities)
   */
  async getLeadTimeline(leadId: string): Promise<LeadTimeline> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('lead_id', leadId)
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[LeadsService] Error fetching timeline:', error)
        throw error
      }

      return {
        activities: activities as LeadActivity[],
        notes: [] // Notes não implementado ainda
      }
    } catch (error) {
      console.error('[LeadsService] Error in getLeadTimeline:', error)
      return {
        activities: [],
        notes: []
      }
    }
  }

  /**
   * Map database lead to LeadWithStage
   */
  private mapLeadWithStage(lead: any): LeadWithStage {
    // Map score to interest_level
    let interest_level: 'baixo' | 'médio' | 'alto' | 'muito_alto' = 'médio'
    if (lead.score !== null && lead.score !== undefined) {
      if (lead.score <= 25) interest_level = 'baixo'
      else if (lead.score <= 50) interest_level = 'médio'
      else if (lead.score <= 75) interest_level = 'alto'
      else interest_level = 'muito_alto'
    }

    // Sem joins, campos relacionados virão null
    const stage = lead.pipeline_stages || null
    const user = lead.users || null

    return {
      ...lead,
      // Compatibility fields - agora usando coluna stage ENUM
      stage_id: lead.stage, // Mapear stage ENUM para stage_id (compatibilidade)
      stage: lead.stage || 'lead_novo', // Garantir que stage sempre existe
      stage_name: stage?.name || lead.stage || null,
      stage_color: stage?.color || null,
      assigned_user_name: user?.name || user?.email || null,
      assignee_id: lead.assigned_to,
      contact_name: lead.name,
      phone_number: lead.phone,
      interest_level,
      lead_source: lead.source,
      preferred_areas: lead.property_preferences?.neighborhoods || [],
      property_type: lead.property_types || lead.property_preferences?.type || [],
      bedrooms: lead.property_preferences?.bedrooms_min || null,
      last_contact_date: lead.last_contact,
      last_contact_at: lead.last_contact,
      chat_id: null
    }
  }
}

// Export singleton instance
export const leadsService = new LeadsService()

// Export class for custom instances
export { LeadsService }
