/**
 * Supabase Service Role Client
 * USO: Server-side APENAS (API Routes, Server Components)
 * BYPASS RLS: Sim - usa service_role key
 *
 * IMPORTANTE: NUNCA expor service_role key no client-side!
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Validação de variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

/**
 * Cliente Supabase com service role key
 * - Bypassa Row Level Security (RLS)
 * - Acesso total ao banco de dados
 * - Usar apenas em server-side
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Helper function para criar cliente service role
 * Mantém compatibilidade com código existente
 */
export function createServiceRoleClient() {
  return supabaseAdmin
}

/**
 * Type-safe helpers para queries comuns
 */
export const queries = {
  /**
   * Buscar todos os registros de uma tabela com filtros
   */
  async findMany<T extends keyof Database['public']['Tables']>(
    table: T,
    options?: {
      filters?: Record<string, any>
      select?: string
      order?: { column: string; ascending?: boolean }
      limit?: number
    }
  ) {
    let query = supabaseAdmin.from(table).select(options?.select || '*')

    // Aplicar filtros
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    // Ordenação
    if (options?.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending ?? true
      })
    }

    // Limite
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    return query
  },

  /**
   * Buscar um único registro
   */
  async findOne<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string,
    select?: string
  ) {
    return supabaseAdmin
      .from(table)
      .select(select || '*')
      .eq('id', id as any)
      .single()
  },

  /**
   * Criar registro
   */
  async create<T extends keyof Database['public']['Tables']>(
    table: T,
    data: Database['public']['Tables'][T]['Insert']
  ) {
    return supabaseAdmin.from(table).insert(data as any).select().single()
  },

  /**
   * Atualizar registro
   */
  async update<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string,
    data: Database['public']['Tables'][T]['Update']
  ) {
    return supabaseAdmin
      .from(table)
      .update(data as any)
      .eq('id', id as any)
      .select()
      .single()
  },

  /**
   * Deletar registro
   */
  async delete<T extends keyof Database['public']['Tables']>(
    table: T,
    id: string
  ) {
    return supabaseAdmin.from(table).delete().eq('id', id as any)
  },

  /**
   * Executar query SQL customizada
   */
  async rpc<T = any>(functionName: string, params?: Record<string, any>) {
    return supabaseAdmin.rpc(functionName as any, params as any) as any as Promise<{
      data: T | null
      error: any
    }>
  }
}

export default supabaseAdmin
