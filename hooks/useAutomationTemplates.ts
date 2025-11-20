import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AutomationTemplate } from '@/lib/automation/types';
import { useAccount } from './useAccount';

export function useAutomationTemplates() {
  const queryClient = useQueryClient();
  const { accountId } = useAccount();

  // Templates pré-definidos (movido para o início)
  const defaultTemplates = [
    {
      name: 'Boas-vindas a Novos Leads',
      description: 'Envia automaticamente uma mensagem de boas-vindas quando um novo lead for cadastrado',
      category: 'welcome',
      tags: ['lead', 'boas-vindas', 'whatsapp'],
      workflow: {
        name: 'Boas-vindas a Novos Leads',
        nodes: [],
        edges: []
      }
    },
    {
      name: 'Follow-up Automático',
      description: 'Agende mensagens de follow-up baseadas em interações do lead',
      category: 'follow_up',
      tags: ['follow-up', 'engajamento', 'tempo'],
      workflow: {
        name: 'Follow-up Automático',
        nodes: [],
        edges: []
      }
    },
    {
      name: 'Qualificação de Leads com IA',
      description: 'Use IA para qualificar automaticamente leads baseado em suas interações',
      category: 'qualification',
      tags: ['ia', 'qualificação', 'score'],
      workflow: {
        name: 'Qualificação de Leads com IA',
        nodes: [],
        edges: []
      }
    },
    {
      name: 'Lembrete de Visita Agendada',
      description: 'Envie lembretes automáticos antes de visitas agendadas',
      category: 'notification',
      tags: ['visita', 'lembrete', 'agenda'],
      workflow: {
        name: 'Lembrete de Visita',
        nodes: [],
        edges: []
      }
    },
    {
      name: 'Nutrição de Leads por Interesse',
      description: 'Envie conteúdo relevante baseado nos interesses do lead',
      category: 'nurturing',
      tags: ['nutrição', 'conteúdo', 'interesse'],
      workflow: {
        name: 'Nutrição por Interesse',
        nodes: [],
        edges: []
      }
    }
  ];

  // Buscar todos os templates
  const templates = useQuery({
    queryKey: ['automation-templates', accountId],
    queryFn: async () => {
      // Modo demo - retornar templates mockados
      console.log('🎭 Modo demo: retornando templates de automação mockados');
      
      const mockTemplates: AutomationTemplate[] = [
        {
          id: 'template-1',
          name: 'Boas-vindas a Novos Leads',
          description: 'Envia automaticamente uma mensagem de boas-vindas quando um novo lead for cadastrado',
          category: 'welcome',
          tags: ['lead', 'boas-vindas', 'whatsapp'],
          icon: '👋',
          usage_count: 245,
          is_featured: true,
          workflow: defaultTemplates[0].workflow
        },
        {
          id: 'template-2',
          name: 'Follow-up Automático',
          description: 'Agende mensagens de follow-up baseadas em interações do lead',
          category: 'follow_up',
          tags: ['follow-up', 'engajamento', 'tempo'],
          icon: '📅',
          usage_count: 189,
          is_featured: true,
          workflow: defaultTemplates[1].workflow
        },
        {
          id: 'template-3',
          name: 'Qualificação de Leads com IA',
          description: 'Use IA para qualificar automaticamente leads baseado em suas interações',
          category: 'qualification',
          tags: ['ia', 'qualificação', 'score'],
          icon: '🤖',
          usage_count: 156,
          is_featured: true,
          workflow: defaultTemplates[2].workflow
        },
        {
          id: 'template-4',
          name: 'Lembrete de Visita Agendada',
          description: 'Envie lembretes automáticos antes de visitas agendadas',
          category: 'notification',
          tags: ['visita', 'lembrete', 'agenda'],
          icon: '🔔',
          usage_count: 134,
          is_featured: false,
          workflow: defaultTemplates[3].workflow
        },
        {
          id: 'template-5',
          name: 'Nutrição de Leads por Interesse',
          description: 'Envie conteúdo relevante baseado nos interesses do lead',
          category: 'nurturing',
          tags: ['nutrição', 'conteúdo', 'interesse'],
          icon: '🎯',
          usage_count: 98,
          is_featured: false,
          workflow: defaultTemplates[4].workflow
        },
        {
          id: 'template-6',
          name: 'Distribuição Automática de Leads',
          description: 'Distribua leads entre corretores baseado em critérios personalizados',
          category: 'distribution',
          tags: ['distribuição', 'corretor', 'automático'],
          icon: '📊',
          usage_count: 87,
          is_featured: false,
          workflow: {
            name: 'Distribuição de Leads',
            nodes: [],
            edges: []
          }
        },
        {
          id: 'template-7',
          name: 'Reativação de Leads Frios',
          description: 'Reative leads que não interagem há mais de 30 dias',
          category: 'reactivation',
          tags: ['reativação', 'lead frio', 'campanha'],
          icon: '❄️',
          usage_count: 76,
          is_featured: false,
          workflow: {
            name: 'Reativação de Leads',
            nodes: [],
            edges: []
          }
        },
        {
          id: 'template-8',
          name: 'Pesquisa de Satisfação Pós-Visita',
          description: 'Envie pesquisas automáticas após visitas realizadas',
          category: 'feedback',
          tags: ['pesquisa', 'satisfação', 'feedback'],
          icon: '📝',
          usage_count: 65,
          is_featured: false,
          workflow: {
            name: 'Pesquisa Pós-Visita',
            nodes: [],
            edges: []
          }
        }
      ] as AutomationTemplate[];
      
      return mockTemplates;
    },
    enabled: true // Sempre habilitado em modo demo
  });

  // Buscar templates por categoria
  const getTemplatesByCategory = (category: string) => {
    return templates.data?.filter(t => t.category === category) || [];
  };

  // Buscar templates em destaque
  const featuredTemplates = useQuery({
    queryKey: ['automation-templates-featured', accountId],
    queryFn: async () => {
      // Modo demo - retornar templates em destaque
      console.log('🎭 Modo demo: retornando templates em destaque');
      
      // Filtrar apenas os templates em destaque
      return templates.data?.filter(t => t.is_featured) || [];
    },
    enabled: true // Sempre habilitado em modo demo
  });

  // Buscar template específico
  const getTemplate = async (id: string): Promise<AutomationTemplate | null> => {
    const response = await fetch(`/api/automation-templates?id=${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch template');
    }

    const result = await response.json();
    return result.data;
  };

  // Incrementar contador de uso
  const incrementUsageCount = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch('/api/automation-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment_usage', templateId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to increment usage count');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-templates', accountId] });
    }
  });

  return {
    templates,
    featuredTemplates,
    getTemplate,
    getTemplatesByCategory,
    incrementUsageCount,
    defaultTemplates
  };
}
