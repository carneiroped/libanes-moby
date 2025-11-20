'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAccount } from '@/hooks/useAccount'

export type EventType = 'property_visit' | 'meeting' | 'contract_signing' | 'call' | 'task' | 'follow_up'
export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export interface Event {
  id: string
  account_id: string
  organizer_id: string
  type: EventType
  title: string
  description?: string
  lead_id?: string
  property_id?: string
  contract_id?: string
  start_at: string
  end_at: string
  all_day: boolean
  timezone: string
  location?: any
  meeting_url?: string
  check_in_at?: string
  check_in_location?: any
  check_out_at?: string
  check_out_notes?: string
  status: EventStatus
  reminder_minutes?: number[]
  notifications_sent?: any
  created_at: string
  cancelled_at?: string
  // Dados relacionados
  lead_name?: string
  property_title?: string
}

export interface CreateEventInput {
  type: EventType
  title: string
  description?: string
  lead_id?: string
  property_id?: string
  contract_id?: string
  start_at: string
  end_at: string
  all_day?: boolean
  timezone?: string
  location?: any
  meeting_url?: string
  reminder_minutes?: number[]
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: EventStatus
  check_in_at?: string
  check_in_location?: any
  check_out_at?: string
  check_out_notes?: string
  cancelled_at?: string
}

export function useEvents(filters?: {
  start_date?: string
  end_date?: string
  type?: EventType
  status?: EventStatus
  lead_id?: string
  property_id?: string
  organizer_id?: string
}) {
  const { accountId } = useAccount()

  return useQuery({
    queryKey: ['events', filters, accountId],
    queryFn: async () => {
      if (!accountId) return [];

      try {
        const params = new URLSearchParams()

        if (filters?.start_date) params.append('start_date', filters.start_date)
        if (filters?.end_date) params.append('end_date', filters.end_date)
        if (filters?.type) params.append('type', filters.type)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.lead_id) params.append('lead_id', filters.lead_id)
        if (filters?.property_id) params.append('property_id', filters.property_id)
        if (filters?.organizer_id) params.append('owner_id', filters.organizer_id)

        const response = await fetch(`/api/events?${params}`)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to fetch events')
        }

        const result = await response.json()
        // Handle both direct array and { data: array } formats
        const data = Array.isArray(result) ? result : (result.data || [])
        return data as Event[]
      } catch (error) {
        console.error('Erro na consulta de eventos:', error)
        throw error
      }
    }
  })
}

export function useEvent(id: string) {
  const { accountId } = useAccount()
  
  return useQuery({
    queryKey: ['event', id, accountId],
    queryFn: async () => {
      if (!accountId) return null
      
      const response = await fetch(`/api/events/${id}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch event')
      }

      const data = await response.json()
      return data as Event
    },
    enabled: !!id && !!accountId
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  const { accountId } = useAccount()

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!accountId) throw new Error('Account ID não encontrado')

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create event')
      }

      const data = await response.json()
      return data as Event
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento criado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao criar evento:', error)
      toast.error('Erro ao criar evento')
    }
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const { accountId } = useAccount()

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateEventInput & { id: string }) => {
      if (!accountId) throw new Error('Account ID não encontrado')

      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update event')
      }

      const data = await response.json()
      return data as Event
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar evento:', error)
      toast.error('Erro ao atualizar evento')
    }
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const { accountId } = useAccount()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!accountId) throw new Error('Account ID não encontrado')
      
      try {
        const response = await fetch(`/api/events?id=${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete event')
        }
      } catch (error) {
        console.error('Erro na exclusão do evento:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento excluído com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao excluir evento:', error)
      toast.error('Erro ao excluir evento')
    }
  })
}

export function useCheckInEvent() {
  const queryClient = useQueryClient()
  const { accountId } = useAccount()

  return useMutation({
    mutationFn: async ({ id, location }: { id: string; location?: { lat: number; lng: number } }) => {
      if (!accountId) throw new Error('Account ID não encontrado')
      
      try {
        const response = await fetch('/api/events/check-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, location }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to check-in')
        }

        const data = await response.json()
        return data as Event
      } catch (error) {
        console.error('Erro no check-in do evento:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Check-in realizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao fazer check-in:', error)
      toast.error('Erro ao fazer check-in')
    }
  })
}

export function useCheckOutEvent() {
  const queryClient = useQueryClient()
  const { accountId } = useAccount()

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      if (!accountId) throw new Error('Account ID não encontrado')
      
      try {
        const response = await fetch('/api/events/check-out', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, notes }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to check-out')
        }

        const data = await response.json()
        return data as Event
      } catch (error) {
        console.error('Erro no check-out do evento:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Check-out realizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao fazer check-out:', error)
      toast.error('Erro ao fazer check-out')
    }
  })
}

export function useEventsByPeriod(startDate: string, endDate: string, ownerId?: string) {
  const { accountId } = useAccount()
  
  return useQuery({
    queryKey: ['events', 'period', startDate, endDate, ownerId, accountId],
    queryFn: async () => {
      if (!accountId) return []
      
      try {
        const params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
        })
        
        if (ownerId) params.append('owner_id', ownerId)

        const response = await fetch(`/api/events/by-period?${params}`)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to fetch events by period')
        }

        const data = await response.json()
        return data as Event[]
      } catch (error) {
        console.error('Erro na consulta de eventos por período:', error)
        throw error
      }
    }
  })
}

export function useEventConflicts() {
  return useMutation({
    mutationFn: async ({ 
      ownerId, 
      startAt, 
      endAt, 
      excludeEventId 
    }: { 
      ownerId: string; 
      startAt: string; 
      endAt: string; 
      excludeEventId?: string;
    }) => {
      try {
        const response = await fetch('/api/events/conflicts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ownerId, startAt, endAt, excludeEventId }),
        })

        if (!response.ok) {
          // Check if response has content before parsing
          const text = await response.text()
          let errorMessage = 'Failed to check conflicts'

          if (text) {
            try {
              const error = JSON.parse(text)
              errorMessage = error.error || errorMessage
            } catch {
              errorMessage = text
            }
          }

          throw new Error(errorMessage)
        }

        const text = await response.text()
        const data = text ? JSON.parse(text) : []
        return data || []
      } catch (error) {
        console.error('Erro na verificação de conflitos:', error)
        // Return empty array instead of throwing to prevent UI breaks
        return []
      }
    }
  })
}

// Funções auxiliares
export function getEventTypeColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    property_visit: 'bg-blue-100 text-blue-800',
    meeting: 'bg-purple-100 text-purple-800',
    contract_signing: 'bg-green-100 text-green-800',
    call: 'bg-yellow-100 text-yellow-800',
    task: 'bg-orange-100 text-orange-800',
    follow_up: 'bg-pink-100 text-pink-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

export function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    property_visit: 'Visita ao Imóvel',
    meeting: 'Reunião',
    contract_signing: 'Assinatura de Contrato',
    call: 'Ligação',
    task: 'Tarefa',
    follow_up: 'Follow-up'
  }
  return labels[type] || type
}

export function getEventStatusColor(status: EventStatus): string {
  const colors: Record<EventStatus, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    no_show: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getEventStatusLabel(status: EventStatus): string {
  const labels: Record<EventStatus, string> = {
    scheduled: 'Agendado',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    no_show: 'Não Compareceu'
  }
  return labels[status] || status
}