/**
 * Properties Service - Supabase Real Database
 * Handles all property-related operations with real Supabase database
 * TODAS as funcionalidades mantidas
 */

import { supabase, getUserAccountId } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Database types
type DbProperty = Database['public']['Tables']['imoveis']['Row']
type DbPropertyInsert = Database['public']['Tables']['imoveis']['Insert']
type DbPropertyUpdate = Database['public']['Tables']['imoveis']['Update']

// Export types for compatibility
export type Property = DbProperty
export type PropertyInsert = DbPropertyInsert
export type PropertyUpdate = DbPropertyUpdate
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'rented' | 'inactive'

// Extended types - Map database columns to UI-friendly names
export interface PropertyWithDetails {
  // Database fields (imoveis table)
  id: string
  descricao: string | null
  bairro: string | null
  cidade: string | null
  lat: number | null
  long: number | null
  m2: number | null
  quartos: number | null
  garagem: number | null
  foto: string | null
  valor: number | null
  banheiros: number | null
  loc_venda: string | null
  created_at: string | null
  updated_at: string | null

  // Mapped/computed fields for UI
  code?: string  // Map to descricao or generate
  title?: string  // Map to descricao
  description?: string  // Map to descricao
  type?: string  // Derived from loc_venda
  purpose?: string  // Derived from loc_venda
  status?: string
  neighborhood?: string  // Map to bairro
  city?: string  // Map to cidade
  state?: string
  latitude?: number  // Map to lat
  longitude?: number  // Map to long
  total_area?: number  // Map to m2
  built_area?: number
  land_area?: number
  bedrooms?: number  // Map to quartos
  suites?: number
  bathrooms?: number  // Map to banheiros
  parking_spaces?: number  // Map to garagem
  floor?: number
  sale_price?: number  // Map to valor
  rent_price?: number
  condo_fee?: number
  iptu?: number
  pricing_options?: any
  owner_name?: string
  owner_phone?: string
  owner_email?: string
  commission?: number
  virtual_tour_url?: string
  meta_title?: string
  meta_description?: string
  site?: string
  address?: {
    street?: string
    number?: string
    complement?: string
    district?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }

  // Extended fields
  images?: Array<{
    id: string
    url: string
    alt_text?: string
    is_primary: boolean
  }>
  interested_leads_count?: number
  visits_scheduled?: number
}

export interface PropertyFilters {
  status?: PropertyStatus | PropertyStatus[]
  type?: string
  location?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  bathrooms?: number
  min_area?: number
  max_area?: number
  search?: string
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PropertiesResponse {
  properties: PropertyWithDetails[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface PropertyAnalytics {
  views: number
  interests: number
  visits: number
  conversion_rate: number
  average_time_on_market: number
}

/**
 * Properties Service Class
 */
class PropertiesService {
  /**
   * Get all properties with filters and pagination
   * MANTÉM TODOS OS FILTROS
   */
  async getProperties(filters: PropertyFilters = {}): Promise<PropertiesResponse> {
    try {
      const accountId = await getUserAccountId()
      console.log('🔍 [PropertiesService] Account ID obtido:', accountId)

      if (!accountId) {
        throw new Error('User not authenticated or no account found')
      }

      const {
        status,
        type,
        location,
        min_price,
        max_price,
        bedrooms,
        bathrooms,
        min_area,
        max_area,
        search,
        page = 1,
        limit = 20,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = filters

      console.log('🔍 [PropertiesService] Filtros recebidos:', filters)

      // Build query with count
      let query = supabase
        .from('imoveis')
        .select('*', { count: 'exact' })
        .eq('account_id', accountId)

      console.log('🔍 [PropertiesService] Query montada para account_id:', accountId)

      // Apply filters - USANDO COLUNAS CORRETAS DA TABELA IMOVEIS
      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status)
        } else {
          query = query.eq('status', status)
        }
      }

      if (type) {
        query = query.eq('tipo', type) // COLUNA CORRETA: tipo
      }

      if (location) {
        query = query.or(`cidade.ilike.%${location}%,bairro.ilike.%${location}%`)
      }

      if (min_price !== undefined) {
        query = query.gte('valor', min_price) // COLUNA CORRETA: valor
      }

      if (max_price !== undefined) {
        query = query.lte('valor', max_price) // COLUNA CORRETA: valor
      }

      if (bedrooms !== undefined) {
        query = query.eq('quartos', bedrooms) // COLUNA CORRETA: quartos
      }

      if (bathrooms !== undefined) {
        query = query.eq('banheiros', bathrooms) // COLUNA CORRETA: banheiros
      }

      if (min_area !== undefined) {
        query = query.gte('m2', min_area) // COLUNA CORRETA: m2
      }

      if (max_area !== undefined) {
        query = query.lte('m2', max_area) // COLUNA CORRETA: m2
      }

      if (search) {
        query = query.or(`descricao.ilike.%${search}%,bairro.ilike.%${search}%,cidade.ilike.%${search}%`)
      }

      // Sorting
      const ascending = sort_order === 'asc'
      query = query.order(sort_by, { ascending })

      // Pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      console.log('📊 [PropertiesService] Resultado da query:')
      console.log('  - Data length:', data?.length || 0)
      console.log('  - Count:', count)
      console.log('  - Error:', error)
      if (data && data.length > 0) {
        console.log('  - Primeiro item:', data[0])
      }

      if (error) {
        console.error('❌ [PropertiesService] Error fetching properties:', error)
        throw error
      }

      // Map to PropertyWithDetails
      const properties: PropertyWithDetails[] = (data || []).map(prop => this.mapPropertyWithDetails(prop))

      console.log('✅ [PropertiesService] Propriedades mapeadas:', properties.length)

      return {
        properties,
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error('[PropertiesService] Error in getProperties:', error)
      return {
        properties: [],
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 0
      }
    }
  }

  /**
   * Get a single property by ID
   * MANTÉM FUNCIONALIDADE COMPLETA
   */
  async getProperty(propertyId: string): Promise<PropertyWithDetails | null> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .eq('id', propertyId)
        .eq('account_id', accountId)
        .single()

      if (error) {
        console.error('[PropertiesService] Error fetching property:', error)
        return null
      }

      return this.mapPropertyWithDetails(data)
    } catch (error) {
      console.error('[PropertiesService] Error in getProperty:', error)
      return null
    }
  }

  /**
   * Create a new property
   * MANTÉM TODOS OS CAMPOS
   */
  async createProperty(propertyData: Partial<PropertyInsert>): Promise<Property> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('imoveis')
        .insert({
          account_id: accountId,
          ...propertyData
        })
        .select()
        .single()

      if (error) {
        console.error('[PropertiesService] Error creating property:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('[PropertiesService] Error in createProperty:', error)
      throw error
    }
  }

  /**
   * Update a property
   * MANTÉM TODOS OS CAMPOS
   */
  async updateProperty(propertyId: string, updates: Partial<PropertyUpdate>): Promise<Property> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('imoveis')
        .update(updates)
        .eq('id', propertyId)
        .eq('account_id', accountId)
        .select()
        .single()

      if (error) {
        console.error('[PropertiesService] Error updating property:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('[PropertiesService] Error in updateProperty:', error)
      throw error
    }
  }

  /**
   * Delete a property
   * MANTÉM FUNCIONALIDADE
   */
  async deleteProperty(propertyId: string): Promise<void> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('imoveis')
        .delete()
        .eq('id', propertyId)
        .eq('account_id', accountId)

      if (error) {
        console.error('[PropertiesService] Error deleting property:', error)
        throw error
      }
    } catch (error) {
      console.error('[PropertiesService] Error in deleteProperty:', error)
      throw error
    }
  }

  /**
   * Update property status
   * MANTÉM FUNCIONALIDADE
   */
  async updateStatus(propertyId: string, status: PropertyStatus): Promise<Property> {
    return this.updateProperty(propertyId, { status })
  }

  /**
   * Upload property images
   * IMPLEMENTAÇÃO COMPLETA COM SUPABASE STORAGE
   */
  async uploadImages(propertyId: string, files: File[]): Promise<Array<{
    id: string
    url: string
    alt_text?: string
  }>> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const uploadedImages: Array<{
        id: string
        url: string
        alt_text?: string
      }> = []

      for (const file of files) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${propertyId}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file)

        if (uploadError) {
          console.error('[PropertiesService] Error uploading image:', uploadError)
          throw uploadError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        uploadedImages.push({
          id: fileName,
          url: publicUrl,
          alt_text: file.name
        })
      }

      // Update property images array
      const { data: property } = await supabase
        .from('imoveis')
        .select('galeria_fotos')
        .eq('id', propertyId)
        .single()

      const currentImages = property?.galeria_fotos || []
      const newImages = [...currentImages, ...uploadedImages.map(img => img.url)]

      await supabase
        .from('imoveis')
        .update({ galeria_fotos: newImages })
        .eq('id', propertyId)

      return uploadedImages
    } catch (error) {
      console.error('[PropertiesService] Error in uploadImages:', error)
      throw error
    }
  }

  /**
   * Delete property image
   * IMPLEMENTAÇÃO COMPLETA
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('property-images')
        .remove([imageId])

      if (error) {
        console.error('[PropertiesService] Error deleting image:', error)
        throw error
      }
    } catch (error) {
      console.error('[PropertiesService] Error in deleteImage:', error)
      throw error
    }
  }

  /**
   * Search properties with advanced filters
   * MANTÉM BUSCA AVANÇADA
   */
  async searchProperties(query: string, filters?: PropertyFilters): Promise<PropertyWithDetails[]> {
    const response = await this.getProperties({
      ...filters,
      search: query
    })
    return response.properties
  }

  /**
   * Get properties analytics
   * IMPLEMENTAÇÃO COMPLETA COM CÁLCULOS REAIS
   */
  async getAnalytics(propertyId?: string): Promise<PropertyAnalytics> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      // Se propertyId específico, buscar analytics desse imóvel
      if (propertyId) {
        // Buscar activities relacionadas ao imóvel
        const { data: activities } = await supabase
          .from('activities')
          .select('*')
          .eq('account_id', accountId)
          .eq('property_id', propertyId)

        const views = activities?.filter(a => a.type === 'property_view').length || 0
        const interests = activities?.filter(a => a.type === 'property_interest').length || 0
        const visits = activities?.filter(a => a.type === 'property_visit').length || 0

        // Buscar property para calcular time on market
        const { data: property } = await supabase
          .from('imoveis')
          .select('created_at, status')
          .eq('id', propertyId)
          .single()

        let average_time_on_market = 0
        if (property && property.created_at) {
          const createdDate = new Date(property.created_at)
          const now = new Date()
          average_time_on_market = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        }

        const conversion_rate = views > 0 ? (interests / views) * 100 : 0

        return {
          views,
          interests,
          visits,
          conversion_rate,
          average_time_on_market
        }
      }

      // Analytics gerais de todas as propriedades
      const { data: allActivities } = await supabase
        .from('activities')
        .select('*')
        .eq('account_id', accountId)
        .not('property_id', 'is', null)

      const views = allActivities?.filter(a => a.type === 'property_view').length || 0
      const interests = allActivities?.filter(a => a.type === 'property_interest').length || 0
      const visits = allActivities?.filter(a => a.type === 'property_visit').length || 0

      const { data: properties } = await supabase
        .from('imoveis')
        .select('created_at, status')
        .eq('account_id', accountId)

      let totalDays = 0
      let soldCount = 0
      properties?.forEach(prop => {
        if ((prop.status === 'sold' || prop.status === 'rented') && prop.created_at) {
          const createdDate = new Date(prop.created_at)
          const now = new Date()
          totalDays += Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
          soldCount++
        }
      })

      const average_time_on_market = soldCount > 0 ? totalDays / soldCount : 0
      const conversion_rate = views > 0 ? (interests / views) * 100 : 0

      return {
        views,
        interests,
        visits,
        conversion_rate,
        average_time_on_market
      }
    } catch (error) {
      console.error('[PropertiesService] Error in getAnalytics:', error)
      return {
        views: 0,
        interests: 0,
        visits: 0,
        conversion_rate: 0,
        average_time_on_market: 0
      }
    }
  }

  /**
   * Get interested leads for a property
   * IMPLEMENTAÇÃO COMPLETA
   */
  async getInterestedLeads(propertyId: string): Promise<Array<{
    id: string
    name: string
    phone: string
    email?: string
    interest_date: string
    score: number
  }>> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      // Buscar activities de interesse nesta propriedade
      const { data: activities, error } = await supabase
        .from('activities')
        .select(`
          *,
          leads!lead_id (
            id,
            name,
            phone,
            email,
            score
          )
        `)
        .eq('account_id', accountId)
        .eq('property_id', propertyId)
        .eq('activity_type', 'property_interest')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[PropertiesService] Error fetching interested leads:', error)
        throw error
      }

      return (activities || [])
        .filter(a => a.leads)
        .map(a => ({
          id: a.leads!.id,
          name: a.leads!.name,
          phone: a.leads!.phone || '',
          email: a.leads!.email || undefined,
          interest_date: a.created_at || new Date().toISOString(),
          score: a.leads!.score || 0
        }))
    } catch (error) {
      console.error('[PropertiesService] Error in getInterestedLeads:', error)
      return []
    }
  }

  /**
   * Match leads to properties based on criteria
   * IMPLEMENTAÇÃO COMPLETA COM ALGORITMO DE MATCHING
   */
  async matchLeads(propertyId: string): Promise<Array<{
    lead_id: string
    lead_name: string
    match_score: number
    match_reasons: string[]
  }>> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      // Buscar propriedade
      const { data: property } = await supabase
        .from('imoveis')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (!property) {
        throw new Error('Property not found')
      }

      // Buscar todos os leads ativos
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('account_id', accountId)
        .eq('status', 'active')

      if (!leads || leads.length === 0) {
        return []
      }

      // Algoritmo de matching
      const matches = leads.map(lead => {
        let match_score = 0
        const match_reasons: string[] = []

        // Preferências de tipo de imóvel
        const leadPreferences = lead.property_preferences as any
        if (leadPreferences?.type?.includes(property.tipo)) {
          match_score += 30
          match_reasons.push('Tipo de imóvel compatível')
        }

        // Orçamento
        const budget_max = lead.budget_max || 0
        const budget_min = lead.budget_min || 0
        const propertyPrice = property.valor || 0
        if (propertyPrice >= budget_min && propertyPrice <= budget_max) {
          match_score += 25
          match_reasons.push('Dentro do orçamento')
        }

        // Localização
        const preferred_neighborhoods = leadPreferences?.neighborhoods || []
        if (preferred_neighborhoods.includes(property.bairro)) {
          match_score += 20
          match_reasons.push('Bairro preferido')
        }

        // Quartos
        const desired_bedrooms = leadPreferences?.bedrooms_min || 0
        const propertyBedrooms = property.quartos || 0
        if (propertyBedrooms >= desired_bedrooms) {
          match_score += 15
          match_reasons.push('Número de quartos adequado')
        }

        // Lead score (engajamento)
        const leadScore = lead.score || 0
        match_score += leadScore * 0.1

        return {
          lead_id: lead.id,
          lead_name: lead.name,
          match_score: Math.min(match_score, 100),
          match_reasons
        }
      })

      // Ordenar por match score
      return matches
        .filter(m => m.match_score >= 30) // Mínimo 30% de match
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 10) // Top 10 matches
    } catch (error) {
      console.error('[PropertiesService] Error in matchLeads:', error)
      return []
    }
  }

  /**
   * Schedule a property visit
   * IMPLEMENTAÇÃO COMPLETA
   */
  async scheduleVisit(propertyId: string, visitData: {
    lead_id: string
    scheduled_date: string
    notes?: string
  }): Promise<{
    id: string
    scheduled_date: string
    status: string
  }> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data: user } = await supabase.auth.getUser()

      // Criar evento no calendário
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          account_id: accountId,
          title: 'Visita ao imóvel',
          description: visitData.notes || '',
          start_time: visitData.scheduled_date,
          end_time: new Date(new Date(visitData.scheduled_date).getTime() + 60 * 60 * 1000).toISOString(), // +1 hora
          event_type: 'property_visit',
          attendees: [visitData.lead_id],
          created_by: user.user?.id
        })
        .select()
        .single()

      if (error) {
        console.error('[PropertiesService] Error scheduling visit:', error)
        throw error
      }

      // Registrar atividade
      await (supabase
        .from('activities') as any)
        .insert({
          account_id: accountId,
          lead_id: visitData.lead_id,
          property_id: propertyId,
          type: 'property_visit_scheduled',
          description: `Visita agendada para ${visitData.scheduled_date}`,
          user_id: user.user?.id
        })

      return {
        id: data.id,
        scheduled_date: data.start_time,
        status: 'scheduled'
      }
    } catch (error) {
      console.error('[PropertiesService] Error in scheduleVisit:', error)
      throw error
    }
  }

  /**
   * Generate property description using AI
   * IMPLEMENTAÇÃO PLACEHOLDER (requer integração OpenAI)
   */
  async generateDescription(propertyId: string, options?: {
    style?: 'professional' | 'casual' | 'luxury'
    language?: string
    include_features?: boolean
  }): Promise<{ description: string }> {
    try {
      // TODO: Integrar com OpenAI quando disponível
      const { data: property } = await supabase
        .from('imoveis')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (!property) {
        throw new Error('Property not found')
      }

      // Descrição básica temporária (substituir por AI)
      const style = options?.style || 'professional'
      const features = (property.caracteristicas as any)?.features || []

      let description = `${property.tipo} com ${property.quartos} quartos e ${property.banheiros} banheiros, `
      description += `${property.m2}m² em ${property.bairro}, ${property.cidade}. `

      if (options?.include_features && features.length > 0) {
        description += `Características: ${features.join(', ')}.`
      }

      return { description }
    } catch (error) {
      console.error('[PropertiesService] Error in generateDescription:', error)
      throw error
    }
  }

  /**
   * Import properties from external sources
   * IMPLEMENTAÇÃO PLACEHOLDER (requer processamento específico)
   */
  async importProperties(source: 'csv' | 'xml' | 'api', data: any): Promise<{
    imported: number
    errors: string[]
  }> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      // TODO: Implementar parsers específicos para cada fonte
      console.log('[PropertiesService] Import not fully implemented:', source)

      return {
        imported: 0,
        errors: ['Import functionality not fully implemented yet']
      }
    } catch (error) {
      console.error('[PropertiesService] Error in importProperties:', error)
      throw error
    }
  }

  /**
   * Map database property to PropertyWithDetails
   * HELPER PRIVADO - Mapeia colunas do banco para interface UI
   */
  private mapPropertyWithDetails(property: any): PropertyWithDetails {
    // Processar imagens - galeria_fotos é array, foto é string única
    const images = property.galeria_fotos && property.galeria_fotos.length > 0
      ? property.galeria_fotos.map((url: string, index: number) => ({
          id: `${property.id}-${index}`,
          url,
          alt_text: property.descricao || 'Imóvel',
          is_primary: index === 0
        }))
      : property.foto
        ? [{
            id: `${property.id}-0`,
            url: property.foto,
            alt_text: property.descricao || 'Imóvel',
            is_primary: true
          }]
        : []

    // Derivar tipo e finalidade de loc_venda
    // loc_venda pode ser: "venda", "locacao", "ambos"
    const loc_venda = property.loc_venda?.toLowerCase() || ''
    const type = property.tipo || 'apartment' // Usar coluna tipo do banco
    const purpose = loc_venda === 'venda' ? 'sale' : loc_venda === 'locacao' ? 'rent' : 'sale'
    const status = property.status || 'disponivel' // Usar coluna status do banco

    // Converter lat/long de TEXT para number (usar undefined para compatibilidade TypeScript)
    const lat = property.lat ? parseFloat(property.lat) : undefined
    const long = property.long ? parseFloat(property.long) : undefined

    return {
      // Campos diretos do banco
      id: property.id,
      descricao: property.descricao,
      bairro: property.bairro,
      cidade: property.cidade,
      lat: property.lat, // Manter como string (schema original)
      long: property.long, // Manter como string (schema original)
      m2: property.m2,
      quartos: property.quartos,
      garagem: property.garagem, // boolean do schema
      foto: property.foto,
      valor: property.valor ? parseFloat(property.valor.toString()) : null,
      banheiros: property.banheiros,
      loc_venda: property.loc_venda,
      created_at: property.created_at,
      updated_at: property.updated_at,

      // Mapeamentos para UI (campos esperados pela interface)
      code: property.codigo_referencia || property.id.slice(0, 8).toUpperCase(),
      title: property.titulo || property.descricao,
      description: property.descricao,
      type,
      purpose,
      status,
      neighborhood: property.bairro,
      city: property.cidade,
      state: property.estado || '',
      latitude: lat,
      longitude: long,
      total_area: property.m2,
      built_area: property.area_construida ? parseFloat(property.area_construida.toString()) : property.m2,
      land_area: property.area_terreno ? parseFloat(property.area_terreno.toString()) : undefined,
      bedrooms: property.quartos,
      suites: property.suites,
      bathrooms: property.banheiros,
      parking_spaces: property.vagas_garagem || (property.garagem ? 1 : 0),
      floor: property.andar,
      sale_price: loc_venda === 'venda' || loc_venda === 'ambos' ? parseFloat(property.valor?.toString() || '0') : undefined,
      rent_price: loc_venda === 'locacao' || loc_venda === 'ambos' ? parseFloat(property.valor?.toString() || '0') : undefined,
      condo_fee: property.condominio_mensal ? parseFloat(property.condominio_mensal.toString()) : undefined,
      iptu: property.iptu_mensal ? parseFloat(property.iptu_mensal.toString()) : undefined,
      commission: property.comissao_percentual ? parseFloat(property.comissao_percentual.toString()) : undefined,
      virtual_tour_url: property.tour_virtual_url,
      meta_title: property.meta_titulo,
      meta_description: property.meta_descricao,
      site: property.site,
      owner_name: property.proprietario_nome,
      owner_phone: property.proprietario_telefone,
      owner_email: property.proprietario_email,

      // Campos de endereço completo
      address: {
        street: property.rua || '',
        number: property.numero || '',
        complement: property.complemento || '',
        district: property.bairro || '',
        city: property.cidade || '',
        state: property.estado || '',
        zipCode: property.cep || '',
        country: 'Brasil'
      },

      // Campos computados
      images,
      interested_leads_count: 0,
      visits_scheduled: 0
    }
  }
}

// Export singleton instance
export const propertiesService = new PropertiesService()

// Export class for custom instances
export { PropertiesService }
