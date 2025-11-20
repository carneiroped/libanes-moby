import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from './useAccount';

export interface Document {
  id: string;
  account_id: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  content?: string;
  metadata: {
    type?: string;
    category?: string;
    title?: string;
    description?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    tags?: string[];
    created_by?: string;
    version?: string;
    lead_id?: string;
    property_id?: string;
    contract_id?: string;
    [key: string]: any;
  };
  // Campos para arquivos
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  storage_path?: string;
  uploaded_by?: string;
  is_public?: boolean;
  // Campos existentes
  embedding?: number[] | null;
  created_at: string;
  updated_at: string;
}

interface DocumentsResponse {
  documents: Document[];
}

interface DocumentsParams {
  type?: string;
  category?: string;
  limit?: number;
  offset?: number;
  hasFile?: boolean; // Filtrar por documentos com ou sem arquivo
}

export function useDocuments(params: DocumentsParams = {}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['documents', account?.id, params],
    queryFn: async (): Promise<Document[]> => {
      // Modo demo - retornar documentos mockados
      console.log('🎭 Modo demo: retornando documentos mockados');
      
      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          account_id: 'demo-account',
          title: 'Manual de Atendimento ao Cliente',
          description: 'Guia completo para atendimento de leads e clientes',
          category: 'atendimento',
          tags: ['atendimento', 'manual', 'procedimento'],
          content: 'Este manual contém as diretrizes essenciais para um atendimento de qualidade...',
          metadata: {
            type: 'manual',
            category: 'atendimento',
            title: 'Manual de Atendimento ao Cliente',
            tags: ['atendimento', 'manual'],
            version: '2.1'
          },
          file_name: 'manual-atendimento-v2.1.pdf',
          file_size: 2048000,
          file_type: 'application/pdf',
          is_public: true,
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'doc-2',
          account_id: 'demo-account',
          title: 'Checklist de Vistoria',
          description: 'Lista de verificação para vistorias de imóveis',
          category: 'vistoria',
          tags: ['vistoria', 'checklist', 'imovel'],
          content: '1. Verificar estado geral do imóvel\n2. Documentar problemas encontrados\n3. Fotografar detalhes importantes...',
          metadata: {
            type: 'checklist',
            category: 'vistoria',
            title: 'Checklist de Vistoria',
            tags: ['vistoria', 'checklist'],
            version: '1.5'
          },
          file_name: 'checklist-vistoria.docx',
          file_size: 156000,
          file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          is_public: false,
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'doc-3',
          account_id: 'demo-account',
          title: 'Base de Conhecimento - Mercado Imobiliário',
          description: 'Informações sobre tendências e dados do mercado',
          category: 'mercado',
          tags: ['mercado', 'conhecimento', 'dados'],
          content: 'O mercado imobiliário brasileiro apresentou crescimento de 8% no último trimestre...',
          metadata: {
            type: 'knowledge_base',
            category: 'mercado',
            title: 'Base de Conhecimento - Mercado',
            tags: ['mercado', 'dados']
          },
          is_public: true,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'doc-4',
          account_id: 'demo-account',
          title: 'Script de Primeiro Contato',
          description: 'Roteiro para primeira abordagem com leads',
          category: 'atendimento',
          tags: ['script', 'leads', 'primeiro-contato'],
          content: 'Olá [NOME], meu nome é [SEU_NOME] da [EMPRESA]. Vi que você tem interesse em...',
          metadata: {
            type: 'script',
            category: 'atendimento',
            title: 'Script de Primeiro Contato',
            tags: ['script', 'leads']
          },
          is_public: true,
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'doc-5',
          account_id: 'demo-account',
          title: 'Política de Comissões',
          description: 'Regras e diretrizes para cálculo de comissões',
          category: 'comissoes',
          tags: ['politica', 'comissoes', 'vendas'],
          content: 'As comissões são calculadas com base nos seguintes critérios...',
          metadata: {
            type: 'policy',
            category: 'comissoes',
            title: 'Política de Comissões',
            tags: ['politica', 'comissoes'],
            version: '3.0'
          },
          file_name: 'politica-comissoes-v3.pdf',
          file_size: 892000,
          file_type: 'application/pdf',
          is_public: false,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'doc-6',
          account_id: 'demo-account',
          title: 'Procedimento de Captação',
          description: 'Processo completo para captação de novos imóveis',
          category: 'procedimentos',
          tags: ['captacao', 'procedimento', 'imoveis'],
          content: 'O processo de captação segue as seguintes etapas: 1. Prospecção...',
          metadata: {
            type: 'manual',
            category: 'procedimentos',
            title: 'Procedimento de Captação',
            tags: ['captacao', 'procedimento']
          },
          is_public: true,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Aplicar filtros se especificados
      let filteredDocs = mockDocuments;
      
      if (params.type) {
        filteredDocs = filteredDocs.filter(doc => doc.metadata.type === params.type);
      }
      
      if (params.category) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.category === params.category || doc.metadata.category === params.category
        );
      }
      
      if (params.hasFile !== undefined) {
        filteredDocs = filteredDocs.filter(doc => 
          params.hasFile ? !!doc.file_name : !doc.file_name
        );
      }
      
      if (params.limit) {
        filteredDocs = filteredDocs.slice(0, params.limit);
      }
      
      return filteredDocs;
    },
    enabled: true // Sempre habilitado em modo demo
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async (document: { content: string; metadata: any }) => {
      if (!account?.id) {
        throw new Error('Account não encontrada');
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar documento: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDocumentsByType(type: string) {
  return useDocuments({ type });
}

export function useDocumentsByCategory(category: string) {
  return useDocuments({ category });
}

export function useDocumentStats() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['document-stats', account?.id],
    queryFn: async () => {
      // Modo demo - retornar estatísticas mockadas
      console.log('🎭 Modo demo: retornando estatísticas de documentos mockadas');
      
      const mockStats = {
        total: 6,
        byType: {
          manual: 2,
          knowledge_base: 1,
          checklist: 1,
          script: 1,
          policy: 1
        },
        byCategory: {
          atendimento: 2,
          vistoria: 1,
          mercado: 1,
          comissoes: 1,
          procedimentos: 1
        },
        recent: [
          {
            id: 'doc-6',
            title: 'Procedimento de Captação',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'doc-3',
            title: 'Base de Conhecimento - Mercado Imobiliário',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'doc-1',
            title: 'Manual de Atendimento ao Cliente',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'doc-2',
            title: 'Checklist de Vistoria',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'doc-4',
            title: 'Script de Primeiro Contato',
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };

      return mockStats;
    },
    enabled: true // Sempre habilitado em modo demo
  });
}

// Hook para buscar apenas documentos com arquivos
export function useFileDocuments(params: Omit<DocumentsParams, 'hasFile'> = {}) {
  return useDocuments({ ...params, hasFile: true });
}

// Hook para buscar apenas documentos de texto
export function useTextDocuments(params: Omit<DocumentsParams, 'hasFile'> = {}) {
  return useDocuments({ ...params, hasFile: false });
}

// Hook para fazer download de arquivo
export function useDownloadDocument() {
  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/download/${documentId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao fazer download');
      }

      const result = await response.json();
      
      // Abrir URL em nova aba
      window.open(result.downloadUrl, '_blank');
      
      return result;
    },
  });
}

// Hook para upload de arquivo
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro no upload');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}