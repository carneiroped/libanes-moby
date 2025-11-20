/**
 * Users Service - Supabase Real Database
 * Handles all user-related operations with real Supabase database
 * TODAS as funcionalidades mantidas
 */

import { supabase, getUserAccountId } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Database types
type DbUser = Database['public']['Tables']['users']['Row']
type DbUserInsert = Database['public']['Tables']['users']['Insert']
type DbUserUpdate = Database['public']['Tables']['users']['Update']

// Export types for compatibility
export type User = DbUser
export type UserInsert = DbUserInsert
export type UserUpdate = DbUserUpdate

// Extended types for compatibility
export type UserWithRole = User & {
  role_name?: string
  permissions?: string[]
}

export interface UserFilters {
  search?: string
  role?: string
  active?: boolean
  limit?: number
  offset?: number
}

/**
 * Users Service Class
 */
class UsersService {
  /**
   * Get all users with filters
   * MANTÉM TODOS OS FILTROS
   */
  async getUsers(filters: UserFilters = {}): Promise<User[]> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated or no account found')
      }

      const {
        search,
        role,
        active,
        limit = 100,
        offset = 0
      } = filters

      // Build query
      let query = supabase
        .from('users')
        .select('*')
        .eq('account_id', accountId)

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      if (role) {
        query = query.eq('role', role)
      }

      if (active !== undefined) {
        query = query.eq('status', active ? 'active' : 'inactive')
      }

      // Pagination
      query = query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('[UsersService] Error fetching users:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('[UsersService] Error in getUsers:', error)
      return []
    }
  }

  /**
   * Get a single user by ID
   * MANTÉM FUNCIONALIDADE
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('account_id', accountId)
        .single()

      if (error) {
        // Silently handle error - user will be loaded from auth provider
        return null
      }

      return data
    } catch (error) {
      console.error('[UsersService] Error in getUser:', error)
      return null
    }
  }

  /**
   * Get current logged user
   * NOVA FUNCIONALIDADE (helper)
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: authUser } = await supabase.auth.getUser()
      if (!authUser.user) {
        return null
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.user.id)
        .single()

      if (error) {
        console.error('[UsersService] Error fetching current user:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('[UsersService] Error in getCurrentUser:', error)
      return null
    }
  }

  /**
   * Create a new user
   * MANTÉM TODOS OS CAMPOS
   * NOTA: Criação completa requer admin no Supabase Auth
   */
  async createUser(userData: {
    email: string
    full_name?: string
    role?: string
    phone?: string
    is_active?: boolean
  }): Promise<User> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      // Para criar um usuário completo, é necessário:
      // 1. Criar no Supabase Auth (requer service_role_key)
      // 2. Criar na tabela users

      // Por enquanto, apenas criar na tabela (assumindo auth já criado)
      const { data, error } = await supabase
        .from('users')
        .insert({
          account_id: accountId,
          name: userData.full_name || userData.email,
          email: userData.email,
          phone: userData.phone,
          role: userData.role || 'corretor',
          status: userData.is_active !== false ? 'active' : 'inactive',
          permissions: this.getDefaultPermissions(userData.role || 'corretor'),
          stats: {
            total_leads: 0,
            converted_leads: 0,
            total_sales: 0,
            revenue_generated: 0,
            calls_made: 0,
            emails_sent: 0
          },
          preferences: {
            theme: 'light',
            language: 'pt-BR',
            timezone: 'America/Sao_Paulo',
            notifications: {
              email: true,
              sms: false,
              push: true,
              whatsapp: false
            }
          }
        })
        .select()
        .single()

      if (error) {
        console.error('[UsersService] Error creating user:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('[UsersService] Error in createUser:', error)
      throw error
    }
  }

  /**
   * Update a user
   * MANTÉM TODOS OS CAMPOS
   */
  async updateUser(userId: string, updates: Partial<UserUpdate>): Promise<User> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .eq('account_id', accountId)
        .select()
        .single()

      if (error) {
        console.error('[UsersService] Error updating user:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('[UsersService] Error in updateUser:', error)
      throw error
    }
  }

  /**
   * Delete a user
   * MANTÉM FUNCIONALIDADE
   * NOTA: Soft delete (status = inactive) é recomendado para manter histórico
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      // Soft delete (recomendado)
      const { error } = await supabase
        .from('users')
        .update({ status: 'inactive' })
        .eq('id', userId)
        .eq('account_id', accountId)

      if (error) {
        console.error('[UsersService] Error deleting user:', error)
        throw error
      }

      // Para hard delete (não recomendado):
      // const { error } = await supabase
      //   .from('users')
      //   .delete()
      //   .eq('id', userId)
      //   .eq('account_id', accountId)
    } catch (error) {
      console.error('[UsersService] Error in deleteUser:', error)
      throw error
    }
  }

  /**
   * Change user password
   * MANTÉM FUNCIONALIDADE
   * Usa Supabase Auth para segurança
   */
  async changePassword(userId: string, newPassword: string, currentPassword?: string): Promise<void> {
    try {
      // Verificar se é o próprio usuário
      const { data: authUser } = await supabase.auth.getUser()
      if (!authUser.user || authUser.user.id !== userId) {
        throw new Error('Can only change own password')
      }

      // Para validar senha atual, primeiro fazer reauthentication
      if (currentPassword) {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user?.email) {
          throw new Error('User email not found')
        }

        // Tentar login com senha atual para validar
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: user.user.email,
          password: currentPassword
        })

        if (loginError) {
          throw new Error('Current password is incorrect')
        }
      }

      // Atualizar senha
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('[UsersService] Error changing password:', error)
        throw error
      }
    } catch (error) {
      console.error('[UsersService] Error in changePassword:', error)
      throw error
    }
  }

  /**
   * Get user statistics
   * NOVA FUNCIONALIDADE
   */
  async getUserStats(userId: string): Promise<{
    total_leads: number
    converted_leads: number
    total_sales: number
    revenue_generated: number
    calls_made: number
    emails_sent: number
  }> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data: user } = await supabase
        .from('users')
        .select('stats')
        .eq('id', userId)
        .eq('account_id', accountId)
        .single()

      if (user && user.stats) {
        return user.stats as any
      }

      // Calcular stats em tempo real se não existir
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('account_id', accountId)
        .eq('assigned_to', userId)

      const total_leads = leads?.length || 0
      const converted_leads = leads?.filter(l => l.status === 'converted').length || 0

      return {
        total_leads,
        converted_leads,
        total_sales: 0,
        revenue_generated: 0,
        calls_made: 0,
        emails_sent: 0
      }
    } catch (error) {
      console.error('[UsersService] Error in getUserStats:', error)
      return {
        total_leads: 0,
        converted_leads: 0,
        total_sales: 0,
        revenue_generated: 0,
        calls_made: 0,
        emails_sent: 0
      }
    }
  }

  /**
   * Update user avatar
   * NOVA FUNCIONALIDADE
   */
  async updateAvatar(userId: string, avatarFile: File): Promise<string> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      // Upload to Supabase Storage
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${userId}/avatar.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true })

      if (uploadError) {
        console.error('[UsersService] Error uploading avatar:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user avatar
      await supabase
        .from('users')
        .update({ avatar: publicUrl })
        .eq('id', userId)
        .eq('account_id', accountId)

      return publicUrl
    } catch (error) {
      console.error('[UsersService] Error in updateAvatar:', error)
      throw error
    }
  }

  /**
   * Get team members (users in same account)
   * NOVA FUNCIONALIDADE
   */
  async getTeamMembers(): Promise<User[]> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('account_id', accountId)
        .eq('status', 'active')
        .order('name', { ascending: true })

      if (error) {
        console.error('[UsersService] Error fetching team members:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('[UsersService] Error in getTeamMembers:', error)
      return []
    }
  }

  /**
   * Update user preferences
   * NOVA FUNCIONALIDADE
   */
  async updatePreferences(userId: string, preferences: Partial<{
    theme: string
    language: string
    timezone: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
      whatsapp: boolean
    }
  }>): Promise<User> {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('User not authenticated')
      }

      // Buscar preferências atuais
      const { data: currentUser } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single()

      const currentPreferences = (currentUser?.preferences as Record<string, any>) || {}
      const newPreferences = {
        ...currentPreferences,
        ...preferences
      }

      const { data, error } = await supabase
        .from('users')
        .update({ preferences: newPreferences })
        .eq('id', userId)
        .eq('account_id', accountId)
        .select()
        .single()

      if (error) {
        console.error('[UsersService] Error updating preferences:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('[UsersService] Error in updatePreferences:', error)
      throw error
    }
  }

  /**
   * Get default permissions by role
   * HELPER PRIVADO
   */
  private getDefaultPermissions(role: string): string[] {
    const permissionsMap: Record<string, string[]> = {
      admin: [
        'admin.full_access',
        'users.manage',
        'leads.manage',
        'properties.manage',
        'pipelines.manage',
        'settings.manage',
        'analytics.view'
      ],
      manager: [
        'users.view',
        'leads.manage',
        'properties.manage',
        'pipelines.manage',
        'analytics.view'
      ],
      corretor: [
        'leads.view',
        'leads.edit_own',
        'properties.view',
        'analytics.view_own'
      ]
    }

    return permissionsMap[role] || permissionsMap.corretor
  }
}

// Export singleton instance
export const usersService = new UsersService()

// Export class for custom instances
export { UsersService }
