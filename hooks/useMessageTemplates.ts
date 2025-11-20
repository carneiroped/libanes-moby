import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount } from './useAccount'
import { toast } from '@/hooks/use-toast'

interface TemplateFilters {
  search?: string
  category?: string
  channel?: string
}

interface TemplateData {
  name: string
  content: string
  variables?: string[]
  category?: string
  channel?: string[]
  is_active?: boolean
}

export function useMessageTemplates(filters?: TemplateFilters) {
  const { accountId } = useAccount()

  return useQuery({
    queryKey: ['message-templates', accountId, filters],
    queryFn: async () => {
      if (!accountId) throw new Error('No account ID')

      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.channel) params.append('channel', filters.channel)

      const response = await fetch(`/api/message-templates?${params}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch message templates')
      }

      const result = await response.json()
      return result.data
    },
    enabled: !!accountId,
  })
}

export function useMessageTemplate(templateId: string) {
  const { accountId } = useAccount()

  return useQuery({
    queryKey: ['message-template', templateId, accountId],
    queryFn: async () => {
      if (!accountId) throw new Error('No account ID')

      const response = await fetch(`/api/message-templates?id=${templateId}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch message template')
      }

      const result = await response.json()
      return result.data?.[0] // Since we're fetching a single template
    },
    enabled: !!accountId && !!templateId,
  })
}

export function useCreateTemplate() {
  const { accountId } = useAccount()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TemplateData) => {
      if (!accountId) throw new Error('No account ID')

      const response = await fetch('/api/message-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create template')
      }

      const result = await response.json()
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates', accountId] })
      toast({
        title: 'Template criado!',
        description: 'O template foi criado com sucesso.',
      })
    },
    onError: (error) => {
      console.error('Error creating template:', error)
      toast({
        title: 'Erro ao criar template',
        description: 'Não foi possível criar o template. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateTemplate() {
  const { accountId } = useAccount()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<TemplateData>) => {
      if (!accountId) throw new Error('No account ID')

      const response = await fetch('/api/message-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update template')
      }

      const result = await response.json()
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['message-templates', accountId] })
      queryClient.invalidateQueries({ queryKey: ['message-template', data.id, accountId] })
      toast({
        title: 'Template atualizado!',
        description: 'O template foi atualizado com sucesso.',
      })
    },
    onError: (error) => {
      console.error('Error updating template:', error)
      toast({
        title: 'Erro ao atualizar template',
        description: 'Não foi possível atualizar o template. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteTemplate() {
  const { accountId } = useAccount()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      if (!accountId) throw new Error('No account ID')

      const response = await fetch(`/api/message-templates?id=${templateId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete template')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates', accountId] })
      toast({
        title: 'Template removido!',
        description: 'O template foi removido com sucesso.',
      })
    },
    onError: (error) => {
      console.error('Error deleting template:', error)
      toast({
        title: 'Erro ao remover template',
        description: 'Não foi possível remover o template. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}

export function useDuplicateTemplate() {
  const { accountId } = useAccount()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      if (!accountId) throw new Error('No account ID')

      // First fetch the original template
      const fetchResponse = await fetch(`/api/message-templates?id=${templateId}`)
      if (!fetchResponse.ok) {
        const error = await fetchResponse.json()
        throw new Error(error.error || 'Failed to fetch template')
      }

      const { data: templates } = await fetchResponse.json()
      const original = templates?.[0]
      if (!original) throw new Error('Template not found')

      // Create duplicate
      const duplicateData = {
        ...original,
        id: undefined,
        name: `${original.name} (Cópia)`,
        usage_count: 0,
        created_at: undefined,
        updated_at: undefined,
      }

      const createResponse = await fetch('/api/message-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData),
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || 'Failed to duplicate template')
      }

      const result = await createResponse.json()
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates', accountId] })
      toast({
        title: 'Template duplicado!',
        description: 'Uma cópia do template foi criada.',
      })
    },
    onError: (error) => {
      console.error('Error duplicating template:', error)
      toast({
        title: 'Erro ao duplicar template',
        description: 'Não foi possível duplicar o template. Tente novamente.',
        variant: 'destructive',
      })
    },
  })
}

// Função auxiliar para extrair variáveis do conteúdo
function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const variables = new Set<string>()
  let match

  while ((match = regex.exec(content)) !== null) {
    variables.add(match[1])
  }

  return Array.from(variables)
}

// Hook para renderizar template com variáveis
export function useRenderTemplate(templateId: string, data: Record<string, any>) {
  const { data: template } = useMessageTemplate(templateId)

  if (!template) return null

  let content = template.content

  // Substituir variáveis
  if (template.variables && data) {
    template.variables.forEach((variable: string) => {
      const value = data[variable] || ''
      content = content.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value)
    })
  }

  return content
}