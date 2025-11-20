/**
 * Supabase Client - Browser/Client-side
 * Usado em componentes React e páginas do cliente
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Criar cliente Supabase para o browser
export const supabase = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-client-info': 'moby-crm-web'
      },
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          signal: AbortSignal.timeout(15000), // 15s timeout
        })
      }
    },
    db: {
      schema: 'public'
    }
  }
)

// Export createClient para compatibilidade com imports externos
export const createClient = () => supabase

// Export getClient para compatibilidade
export const getClient = () => supabase

// Helper: Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    // Error logged in production monitoring only
    return null
  }
  return user
}

// Helper: Get user's account_id
// AUTH DISABLED: Always return the Moby Imobiliária account_id
export const getUserAccountId = async (): Promise<string | null> => {
  // Fixed account_id from the database (Moby Imobiliária)
  return '6200796e-5629-4669-a4e1-3d8b027830fa'
}

// Helper: Check if demo mode
export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}