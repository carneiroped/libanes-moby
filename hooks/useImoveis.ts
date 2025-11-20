'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import { propertiesService, type PropertyFilters, type PropertyStatus } from '@/lib/services/properties.service';
import { Database } from '@/types/database.types';

// Tipo da tabela properties adaptado para imóveis
type Property = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

// Interface padronizada para propriedades
interface PropertyStandard {
  id: string;
  title: string;
  description?: string;
  neighborhood: string;
  city: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  total_area?: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  purpose?: string;
  sale_price?: number;
  rent_price?: number;
  images?: any[];
  status?: string;
  type?: string;
  created_at?: string;
  // Campos apenas para compatibilidade temporária
  descricao?: string;
  bairro?: string;
  cidade?: string;
  quartos?: number;
  banheiros?: number;
  garagem?: number;
  m2?: number;
  valor?: number;
  loc_venda?: string;
  foto?: string | null;
}

// Função de mapeamento padronizada (elimina duplicação)
function mapPropertyToStandard(property: Property): PropertyStandard {
  return {
    id: property.id,
    title: property.title || '',
    description: property.description || '',
    neighborhood: property.neighborhood || '',
    city: property.city || '',
    state: property.state || '',
    latitude: property.latitude ?? undefined,
    longitude: property.longitude ?? undefined,
    total_area: property.total_area ?? undefined,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    parking_spaces: property.parking_spaces || 0,
    purpose: property.purpose ?? undefined,
    sale_price: property.sale_price ?? undefined,
    rent_price: property.rent_price ?? undefined,
    images: property.images ? Array.isArray(property.images) ? property.images : [] : undefined,
    status: property.status ?? undefined,
    type: property.type ?? undefined,
    created_at: property.created_at ?? undefined,
    // Compatibilidade temporária (será removida em versões futuras)
    descricao: property.title || property.description || '',
    bairro: property.neighborhood || '',
    cidade: property.city || '',
    quartos: property.bedrooms || 0,
    banheiros: property.bathrooms || 0,
    garagem: property.parking_spaces || 0,
    m2: property.total_area ? Number(property.total_area) : undefined,
    valor: property.purpose === 'sale' 
      ? (property.sale_price ? Number(property.sale_price) : undefined)
      : (property.rent_price ? Number(property.rent_price) : undefined),
    loc_venda: property.purpose === 'sale' ? 'venda' : property.purpose === 'rent' ? 'locacao' : undefined,
    foto: property.images && Array.isArray(property.images) && property.images.length > 0
      ? (typeof property.images[0] === 'string' ? property.images[0] : (property.images[0] as any)?.url || null)
      : null
  };
}

// Função de mapeamento reverso padronizada
function mapStandardToProperty(data: any): Partial<PropertyUpdate> {
  const purpose = data.purpose === 'sale' || data.loc_venda === 'venda' ? 'sale' as const : 'rent' as const;
  
  return {
    title: data.title || data.descricao || 'Imóvel sem título',
    description: data.description || data.descricao,
    neighborhood: data.neighborhood || data.bairro,
    city: data.city || data.cidade,
    state: data.state,
    latitude: data.latitude,
    longitude: data.longitude,
    total_area: data.total_area,
    bedrooms: data.bedrooms || data.quartos || 0,
    bathrooms: data.bathrooms || 0,
    parking_spaces: data.parking_spaces || 0,
    purpose,
    sale_price: purpose === 'sale' ? data.sale_price || data.valor : null,
    rent_price: purpose === 'rent' ? data.rent_price || data.valor : null,
    images: data.images || null
  };
}

// Interface padronizada para filtros
interface PropertyFilter {
  // Campos padronizados
  neighborhood?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  exactBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  purpose?: 'sale' | 'rent';
  type?: string;
  status?: string;
  // Paginação otimizada
  limit?: number;
  cursor?: string; // Para paginação cursor-based
  offset?: number; // Mantido para compatibilidade
  // Campos legados (compatibilidade temporária)
  bairro?: string;
  cidade?: string;
  minValor?: number;
  maxValor?: number;
  minQuartos?: number;
  exactQuartos?: number;
  minBanheiros?: number;
  minM2?: number;
  locVenda?: string;
}

// Hook principal para listar propriedades (interface padronizada - via propertiesService)
function usePropertiesInternal(filters: PropertyFilter = {}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['properties', filters, account?.id],
    queryFn: async () => {
      try {
        console.log('🔍 [usePropertiesInternal] Buscando propriedades');

        // Mapear filtros para PropertyFilters
        const serviceFilters: PropertyFilters = {
          type: filters.type,
          status: filters.status as PropertyStatus | PropertyStatus[] | undefined,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
          bedrooms: filters.minBedrooms || filters.exactBedrooms,
          bathrooms: filters.minBathrooms,
          min_area: filters.minArea,
          location: filters.neighborhood || filters.city || filters.state,
          page: filters.offset ? Math.floor(filters.offset / (filters.limit || 20)) + 1 : 1,
          limit: filters.limit || 20,
          sort_by: 'created_at',
          sort_order: 'desc'
        };

        const result = await propertiesService.getProperties(serviceFilters);

        if (!result) {
          return {
            properties: [],
            count: 0,
            nextCursor: null
          };
        }

        const properties = result.properties.map((property: any) => mapPropertyToStandard(property));

        console.log('✅ [usePropertiesInternal] Propriedades carregadas:', properties.length);

        return {
          properties,
          count: result.total || 0,
          nextCursor: properties.length === (serviceFilters.limit || 20) ? properties[properties.length - 1]?.created_at : null
        };
      } catch (error: any) {
        console.error('❌ [usePropertiesInternal] Erro:', error);
        throw error;
      }
    },
    enabled: true
  });
}

// Hook para busca geoespacial otimizada (simplificado - busca todas e filtra localmente)
function usePropertiesNearbyInternal(lat: number, lng: number, radiusKm: number = 5) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['properties-nearby', lat, lng, radiusKm, account?.id],
    queryFn: async () => {
      try {
        console.log('🔍 [usePropertiesNearby] Buscando propriedades próximas');

        // Buscar todas propriedades (será otimizado posteriormente com geo queries)
        const result = await propertiesService.getProperties({
          limit: 100 // Buscar mais para filtrar localmente
        });

        if (!result) {
          return [];
        }

        // Filtrar por distância usando haversine
        const filtered = result.properties.filter(property => {
          if (!property.latitude || !property.longitude) return false;
          const distance = calculateDistance(lat, lng, property.latitude, property.longitude);
          return distance <= radiusKm;
        });

        console.log('✅ [usePropertiesNearby] Propriedades próximas encontradas:', filtered.length);
        return filtered.map((property: any) => mapPropertyToStandard(property));
      } catch (error: any) {
        console.error('❌ [usePropertiesNearby] Erro:', error);
        return [];
      }
    },
    enabled: !isNaN(lat) && !isNaN(lng)
  });
}

// Função para calcular distância entre dois pontos (Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Hook compatível com interface legada (agora usa propertiesService)
export function useImoveis(filters: PropertyFilter = {}) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['imoveis', filters, account?.id],
    queryFn: async () => {
      try {
        console.log('🔍 [useImoveis] Buscando propriedades com filtros:', filters);

        // Mapear filtros legados para o novo formato
        const serviceFilters: PropertyFilters = {
          type: filters.type,
          status: filters.status as PropertyStatus | PropertyStatus[] | undefined,
          min_price: filters.minPrice || filters.minValor,
          max_price: filters.maxPrice || filters.maxValor,
          bedrooms: filters.minBedrooms || filters.minQuartos || filters.exactBedrooms || filters.exactQuartos,
          bathrooms: filters.minBathrooms || filters.minBanheiros,
          min_area: filters.minArea || filters.minM2,
          location: filters.neighborhood || filters.bairro || filters.city || filters.cidade || filters.state,
          page: filters.offset ? Math.floor(filters.offset / (filters.limit || 10)) + 1 : 1,
          limit: filters.limit || 10,
          sort_by: 'created_at',
          sort_order: 'desc'
        };

        // Buscar propriedades via service
        const result = await propertiesService.getProperties(serviceFilters);

        if (!result) {
          console.log('⚠️ [useImoveis] Service retornou null');
          return {
            imoveis: [],
            properties: [],
            count: 0
          };
        }

        // Mapear para formato compatível
        const imoveis = result.properties.map((property: any) => mapPropertyToStandard(property));

        console.log('✅ [useImoveis] Propriedades carregadas:', imoveis.length);

        return {
          imoveis,
          properties: imoveis,
          count: result.total || 0
        };
      } catch (error: any) {
        console.error('❌ [useImoveis] Erro ao carregar imóveis:', error);
        return {
          imoveis: [],
          properties: [],
          count: 0
        };
      }
    },
    enabled: true
  });
}

// Hook para buscar um imóvel específico (via propertiesService)
export function useImovel(id: string) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['imovel', id, account?.id],
    queryFn: async () => {
      try {
        console.log('🔍 [useImovel] Buscando propriedade:', id);

        const property = await propertiesService.getProperty(id);

        if (!property) {
          throw new Error('Property not found');
        }

        console.log('✅ [useImovel] Propriedade carregada');
        return mapPropertyToStandard(property as any);
      } catch (error: any) {
        console.error('❌ [useImovel] Erro ao carregar propriedade:', error);
        throw error;
      }
    },
    enabled: !!id
  });
}

// Hook para buscar propriedade com dados nativos (para edição - via propertiesService)
export function usePropertyById(id: string) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['property', id, account?.id],
    queryFn: async () => {
      try {
        console.log('🔍 [usePropertyById] Buscando propriedade (dados nativos):', id);

        const property = await propertiesService.getProperty(id);

        if (!property) {
          throw new Error('Property not found');
        }

        console.log('✅ [usePropertyById] Propriedade carregada (dados nativos)');
        return property;
      } catch (error: any) {
        console.error('❌ [usePropertyById] Erro ao carregar propriedade:', error);
        throw error;
      }
    },
    enabled: !!id
  });
}

// Hook para atualizar imóvel (via propertiesService)
export function useUpdateImovel() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        console.log('🔄 [useUpdateImovel] Atualizando propriedade:', id);

        // Mapear dados do formato padronizado para o formato nativo
        const updateData = mapStandardToProperty(data);

        const property = await propertiesService.updateProperty(id, updateData as any);

        if (!property) {
          throw new Error('Failed to update property');
        }

        console.log('✅ [useUpdateImovel] Propriedade atualizada');
        return property;
      } catch (error: any) {
        console.error('❌ [useUpdateImovel] Erro:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      queryClient.invalidateQueries({ queryKey: ['imovel'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
      toast({
        title: 'Sucesso!',
        description: 'Imóvel atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

// Hook para criar imóvel (via propertiesService)
export function useCreateImovel() {
  const queryClient = useQueryClient();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async (data: any) => {
      try {
        console.log('➕ [useCreateImovel] Criando propriedade');

        // Mapear dados do formato padronizado para o formato nativo
        const baseData = mapStandardToProperty(data);

        const propertyData: Partial<PropertyInsert> = {
          title: baseData.title || 'Imóvel sem título',
          description: baseData.description,
          neighborhood: baseData.neighborhood,
          city: baseData.city,
          state: baseData.state,
          latitude: baseData.latitude,
          longitude: baseData.longitude,
          total_area: baseData.total_area,
          bedrooms: baseData.bedrooms,
          bathrooms: baseData.bathrooms,
          parking_spaces: baseData.parking_spaces,
          purpose: baseData.purpose,
          sale_price: baseData.sale_price,
          rent_price: baseData.rent_price,
          images: baseData.images,
          type: (data.type as any) || 'apartment',
          status: (data.status as any) || 'available',
          address: {
            street: data.address?.street || '',
            number: data.address?.number || '',
            neighborhood: data.neighborhood || data.bairro || '',
            city: data.city || data.cidade || '',
            state: data.state || data.address?.state || '',
            zipCode: data.address?.zipCode || ''
          }
        };

        const property = await propertiesService.createProperty(propertyData as any);

        if (!property) {
          throw new Error('Failed to create property');
        }

        console.log('✅ [useCreateImovel] Propriedade criada:', property.id);
        return property;
      } catch (error: any) {
        console.error('❌ [useCreateImovel] Erro:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Sucesso!',
        description: 'Imóvel criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

// Hook para atualizar propriedade com dados nativos (via propertiesService)
export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PropertyUpdate }) => {
      try {
        console.log('🔄 [useUpdateProperty] Atualizando propriedade (dados nativos):', id);

        const property = await propertiesService.updateProperty(id, data as any);

        if (!property) {
          throw new Error('Failed to update property');
        }

        console.log('✅ [useUpdateProperty] Propriedade atualizada');
        return property;
      } catch (error: any) {
        console.error('❌ [useUpdateProperty] Erro:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      queryClient.invalidateQueries({ queryKey: ['imovel'] });
      toast({
        title: 'Sucesso!',
        description: 'Imóvel atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

// Hook para criar propriedade com dados nativos (via propertiesService)
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<PropertyInsert>) => {
      try {
        console.log('➕ [useCreateProperty] Criando propriedade (dados nativos)');

        const property = await propertiesService.createProperty(data as any);

        if (!property) {
          throw new Error('Failed to create property');
        }

        console.log('✅ [useCreateProperty] Propriedade criada:', property.id);
        return property;
      } catch (error: any) {
        console.error('❌ [useCreateProperty] Erro:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      toast({
        title: 'Sucesso!',
        description: 'Imóvel criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

// Hook para deletar propriedade (via propertiesService)
export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log('🗑️ [useDeleteProperty] Deletando propriedade:', id);

        await propertiesService.deleteProperty(id);

        console.log('✅ [useDeleteProperty] Propriedade deletada');
        return { success: true };
      } catch (error: any) {
        console.error('❌ [useDeleteProperty] Erro:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['imoveis'] });
      toast({
        title: 'Sucesso!',
        description: 'Imóvel deletado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao deletar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

// Hook para validar relacionamentos e integridade (simplificado)
function usePropertyRelationshipsInternal(propertyId: string) {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['property-relationships', propertyId, account?.id],
    queryFn: async () => {
      // TODO: Implementar busca de relacionamentos via services quando disponível
      console.log('⚠️ [usePropertyRelationships] Função não implementada ainda');

      return {
        interests: [],
        contracts: [],
        events: [],
        activities: [],
        hasRelationships: false
      };
    },
    enabled: !!propertyId
  });
}

// Hook para estatísticas de propriedades (via propertiesService)
function usePropertyStatsInternal() {
  const { account } = useAccount();

  return useQuery({
    queryKey: ['property-stats', account?.id],
    queryFn: async () => {
      try {
        console.log('📊 [usePropertyStats] Calculando estatísticas de propriedades');

        // Buscar todas propriedades para calcular stats
        const result = await propertiesService.getProperties({
          limit: 1000 // Buscar todas para stats
        });

        if (!result || !result.properties) {
          return {
            total: 0,
            byStatus: {},
            byPurpose: {},
            byType: {}
          };
        }

        const stats = {
          total: result.properties.length,
          byStatus: {} as Record<string, number>,
          byPurpose: {} as Record<string, number>,
          byType: {} as Record<string, number>
        };

        result.properties.forEach(prop => {
          if (prop.status) {
            stats.byStatus[prop.status] = (stats.byStatus[prop.status] || 0) + 1;
          }
          if (prop.purpose) {
            stats.byPurpose[prop.purpose] = (stats.byPurpose[prop.purpose] || 0) + 1;
          }
          if (prop.type) {
            stats.byType[prop.type] = (stats.byType[prop.type] || 0) + 1;
          }
        });

        console.log('✅ [usePropertyStats] Estatísticas calculadas');
        return stats;
      } catch (error: any) {
        console.error('❌ [usePropertyStats] Erro:', error);
        return {
          total: 0,
          byStatus: {},
          byPurpose: {},
          byType: {}
        };
      }
    },
    enabled: true
  });
}

// Exportar tudo que a página precisa
export default useImoveis;
export { 
  usePropertiesInternal as useProperties, 
  usePropertiesNearbyInternal as usePropertiesNearby, 
  usePropertyRelationshipsInternal as usePropertyRelationships, 
  usePropertyStatsInternal as usePropertyStats 
};
export type { PropertyStandard, PropertyFilter };