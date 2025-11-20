'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { supabase, getUserAccountId } from '@/lib/supabase/client'

export interface User {
  id: string
  account_id: string
  email: string
  name: string
  phone?: string | null
  cpf?: string | null
  creci?: string | null
  avatar_url?: string | null
  role: 'admin' | 'manager' | 'agent'
  permissions: Record<string, any>
  is_active: boolean
  last_activity_at: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  email: string
  name: string
  phone?: string
  cpf?: string
  creci?: string
  role: 'admin' | 'manager' | 'agent'
  is_active?: boolean
}

export interface UpdateUserData {
  name?: string
  phone?: string
  cpf?: string
  creci?: string
  role?: 'admin' | 'manager' | 'agent'
  is_active?: boolean
  permissions?: Record<string, any>
}

function normalizeUser(dbUser: any): User {
  // Mapear role: 'corretor' -> 'agent'
  const roleMap: Record<string, 'admin' | 'manager' | 'agent'> = {
    admin: 'admin',
    manager: 'manager',
    corretor: 'agent'
  }

  return {
    id: dbUser.id,
    account_id: dbUser.account_id,
    email: dbUser.email,
    name: dbUser.name,
    phone: dbUser.phone || null,
    cpf: dbUser.cpf || null,
    creci: dbUser.creci || null,
    avatar_url: dbUser.avatar || null,
    role: roleMap[dbUser.role] || 'agent',
    permissions: typeof dbUser.permissions === 'object' && dbUser.permissions !== null
      ? dbUser.permissions
      : {},
    is_active: dbUser.status === 'active',
    last_activity_at: dbUser.last_login || dbUser.created_at || new Date().toISOString(),
    created_at: dbUser.created_at || new Date().toISOString(),
    updated_at: dbUser.updated_at || new Date().toISOString()
  }
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('Account ID não encontrado')
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('account_id', accountId)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      const normalizedUsers = (data || []).map(normalizeUser)
      setUsers(normalizedUsers)
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err)
      setError(err.message)
      toast({
        title: 'Erro ao carregar usuários',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (userData: CreateUserData) => {
    try {
      const accountId = await getUserAccountId()
      if (!accountId) {
        throw new Error('Account ID não encontrado')
      }

      // Mapear role: 'agent' -> 'corretor'
      const dbRole = userData.role === 'agent' ? 'corretor' : userData.role

      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          account_id: accountId,
          email: userData.email,
          name: userData.name,
          phone: userData.phone || null,
          cpf: userData.cpf || null,
          creci: userData.creci || null,
          role: dbRole,
          status: userData.is_active !== false ? 'active' : 'inactive',
          permissions: userData.role === 'admin'
            ? { all: true }
            : userData.role === 'manager'
            ? { manage_leads: true, view_reports: true, manage_agents: true }
            : { manage_own_leads: true, view_properties: true }
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      const newUser = normalizeUser(data)
      setUsers(prev => [newUser, ...prev])

      toast({
        title: 'Usuário criado',
        description: `${userData.name} foi adicionado com sucesso.`
      })

      return newUser
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err)
      toast({
        title: 'Erro ao criar usuário',
        description: err.message,
        variant: 'destructive'
      })
      throw err
    }
  }

  const updateUser = async (id: string, updates: UpdateUserData) => {
    try {
      // Preparar dados para update
      const dbUpdates: Record<string, any> = {}

      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone
      if (updates.cpf !== undefined) dbUpdates.cpf = updates.cpf
      if (updates.creci !== undefined) dbUpdates.creci = updates.creci

      // Mapear role: 'agent' -> 'corretor'
      if (updates.role !== undefined) {
        dbUpdates.role = updates.role === 'agent' ? 'corretor' : updates.role
      }

      // Mapear is_active para status
      if (updates.is_active !== undefined) {
        dbUpdates.status = updates.is_active ? 'active' : 'inactive'
      }

      // Atualizar permissões baseado no role
      if (updates.role) {
        dbUpdates.permissions = updates.role === 'admin'
          ? { all: true }
          : updates.role === 'manager'
          ? { manage_leads: true, view_reports: true, manage_agents: true }
          : { manage_own_leads: true, view_properties: true }
      } else if (updates.permissions) {
        dbUpdates.permissions = updates.permissions
      }

      const { data, error: updateError } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      const updatedUser = normalizeUser(data)
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user))

      toast({
        title: 'Usuário atualizado',
        description: 'As informações foram atualizadas com sucesso.'
      })

      return updatedUser
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err)
      toast({
        title: 'Erro ao atualizar usuário',
        description: err.message,
        variant: 'destructive'
      })
      throw err
    }
  }

  const deleteUser = async (id: string) => {
    try {
      // Marcar como arquivado ao invés de deletar permanentemente
      const { error: deleteError } = await supabase
        .from('users')
        .update({ archived: true })
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      setUsers(prev => prev.filter(user => user.id !== id))

      toast({
        title: 'Usuário removido',
        description: 'O usuário foi removido com sucesso.'
      })
    } catch (err: any) {
      console.error('Erro ao deletar usuário:', err)
      toast({
        title: 'Erro ao remover usuário',
        description: err.message,
        variant: 'destructive'
      })
      throw err
    }
  }

  const toggleUserStatus = async (id: string, is_active: boolean) => {
    try {
      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          status: is_active ? 'active' : 'inactive',
          last_login: is_active ? new Date().toISOString() : undefined
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      const updatedUser = normalizeUser(data)
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user))

      toast({
        title: is_active ? 'Usuário ativado' : 'Usuário desativado',
        description: `O acesso foi ${is_active ? 'liberado' : 'bloqueado'}.`
      })

      return updatedUser
    } catch (err: any) {
      console.error('Erro ao alterar status do usuário:', err)
      toast({
        title: 'Erro ao alterar status',
        description: err.message,
        variant: 'destructive'
      })
      throw err
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refetch: fetchUsers
  }
}