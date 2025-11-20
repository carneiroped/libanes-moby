import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Activity {
  id: string
  account_id: string
  user_id: string
  type: string
  entity_type: string
  entity_id: string
  description: string
  metadata?: any
  lead_id?: string
  property_id?: string
  created_at: string
}

export interface CreateActivityInput {
  type: string
  entity_type: string
  entity_id: string
  description: string
  metadata?: any
  lead_id?: string
  property_id?: string
}

export interface ActivityWithRelations extends Activity {
  user?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  lead?: {
    id: string
    contact_name: string
    phone_number: string
  }
  property?: {
    id: string
    title: string
    address: string
  }
}

export function useActivities(filters?: {
  entity_type?: string
  entity_id?: string
  lead_id?: string
  property_id?: string
  user_id?: string
  type?: string
  start_date?: string
  end_date?: string
  limit?: number
}) {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.entity_type) params.append('entity_type', filters.entity_type)
      if (filters?.entity_id) params.append('entity_id', filters.entity_id)
      if (filters?.lead_id) params.append('lead_id', filters.lead_id)
      if (filters?.property_id) params.append('property_id', filters.property_id)
      if (filters?.user_id) params.append('user_id', filters.user_id)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.start_date) params.append('start_date', filters.start_date)
      if (filters?.end_date) params.append('end_date', filters.end_date)
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/activities?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch activities')
      }

      return response.json() as Promise<ActivityWithRelations[]>
    }
  })
}

export function useLogActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to log activity')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    }
  })
}

export function useRecentActivities(limit: number = 10) {
  return useActivities({ limit })
}

export function useEntityActivities(entityType: string, entityId: string) {
  return useActivities({ entity_type: entityType, entity_id: entityId })
}

export function useUserActivities(userId: string, limit?: number) {
  return useActivities({ user_id: userId, limit })
}

export function useActivityStats(timeRange: 'day' | 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: ['activity-stats', timeRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        stats: 'true',
        timeRange: timeRange
      })

      const response = await fetch(`/api/activities?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch activity stats')
      }

      return response.json()
    }
  })
}

export function useActivityTimeline(filters?: {
  lead_id?: string
  property_id?: string
  days?: number
}) {
  return useQuery({
    queryKey: ['activity-timeline', filters],
    queryFn: async () => {
      const params = new URLSearchParams({ timeline: 'true' })
      
      if (filters?.lead_id) params.append('lead_id', filters.lead_id)
      if (filters?.property_id) params.append('property_id', filters.property_id)
      if (filters?.days) params.append('days', filters.days.toString())

      const response = await fetch(`/api/activities?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch activity timeline')
      }

      return response.json() as Promise<Record<string, ActivityWithRelations[]>>
    }
  })
}