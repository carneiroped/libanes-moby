import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
}

// Mapeamento das features da tabela accounts para o formato FeatureFlag
const FEATURE_DEFINITIONS: Record<string, { name: string; description: string }> = {
  ai: { 
    name: 'Inteligência Artificial', 
    description: 'Ativa o assistente virtual Moby e funcionalidades de IA' 
  },
  calendar: { 
    name: 'Agenda e Calendário', 
    description: 'Sistema de agendamento de visitas e eventos' 
  },
  analytics: { 
    name: 'Analytics e Relatórios', 
    description: 'Dashboards e relatórios avançados' 
  },
  apiAccess: { 
    name: 'Acesso à API', 
    description: 'Permite integração via API REST' 
  },
  documents: { 
    name: 'Gestão de Documentos', 
    description: 'Upload, organização e compartilhamento de documentos' 
  },
  financial: { 
    name: 'Módulo Financeiro', 
    description: 'Contratos, comissões e gestão financeira' 
  },
  automation: { 
    name: 'Automação', 
    description: 'Workflows e processos automatizados' 
  },
  whiteLabel: { 
    name: 'White Label', 
    description: 'Personalização completa da marca' 
  },
  integrations: { 
    name: 'Integrações', 
    description: 'Conectores com portais e sistemas externos' 
  },
  multiChannel: { 
    name: 'Multicanal', 
    description: 'WhatsApp, email, SMS e outros canais' 
  },
  customReports: { 
    name: 'Relatórios Customizados', 
    description: 'Criação de relatórios personalizados' 
  },
  customPipelines: { 
    name: 'Pipelines Customizados', 
    description: 'Criação de funis de venda personalizados' 
  },
  prioritySupport: { 
    name: 'Suporte Prioritário', 
    description: 'Atendimento com prioridade elevada' 
  },
  advancedSecurity: { 
    name: 'Segurança Avançada', 
    description: 'Recursos extras de segurança e auditoria' 
  },
  dedicatedSupport: { 
    name: 'Suporte Dedicado', 
    description: 'Gestor de conta dedicado' 
  },
  unlimitedStorage: { 
    name: 'Armazenamento Ilimitado', 
    description: 'Sem limites para documentos e mídias' 
  },
  customIntegrations: { 
    name: 'Integrações Customizadas', 
    description: 'Desenvolvimento de integrações específicas' 
  }
};

export function useFeatureFlags() {
  const queryClient = useQueryClient();
  
  const getFeatureFlags = async (): Promise<FeatureFlag[]> => {
    // Modo demo - retornar feature flags mockadas
    console.log('🎭 Modo demo: retornando feature flags mockadas');
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 120));
    
    // Features habilitadas na demo
    const enabledFeatures = [
      'ai', 'calendar', 'analytics', 'documents', 
      'financial', 'automation', 'integrations', 'multiChannel'
    ];
    
    // Features desabilitadas na demo
    const disabledFeatures = [
      'apiAccess', 'whiteLabel', 'customReports', 'customPipelines',
      'prioritySupport', 'advancedSecurity', 'dedicatedSupport', 
      'unlimitedStorage', 'customIntegrations'
    ];
    
    return Object.entries(FEATURE_DEFINITIONS).map(([key, definition]) => ({
      id: key,
      key,
      name: definition.name,
      description: definition.description,
      is_enabled: enabledFeatures.includes(key)
    }));
  };
  
  const updateFeatureFlag = async ({ 
    key,
    is_enabled
  }: { 
    key: string;
    is_enabled: boolean;
  }) => {
    // Modo demo - simular atualização de feature flag
    console.log('🎭 Modo demo: simulando atualização de feature flag', key, is_enabled);
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 80));
    
    // Retornar sucesso mockado
    return {
      success: true,
      message: `Feature ${key} ${is_enabled ? 'ativada' : 'desativada'} com sucesso`,
      data: { key, is_enabled }
    };
  };
  
  const featureFlags = useQuery({
    queryKey: ['featureFlags'],
    queryFn: getFeatureFlags
  });
  
  const mutation = useMutation({
    mutationFn: updateFeatureFlag,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast({
        title: 'Sucesso',
        description: data.message || 'Feature atualizada com sucesso',
        variant: 'default'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar feature',
        variant: 'destructive'
      });
    }
  });
  
  return {
    featureFlags: featureFlags.data || [],
    isLoading: featureFlags.isLoading,
    isError: featureFlags.isError,
    updateFeatureFlag: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}