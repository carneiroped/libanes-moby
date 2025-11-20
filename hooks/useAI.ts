'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAccount } from './useAccount';
import { Database } from '@/types/database.types';

// Tipos
type Lead = Database['public']['Tables']['leads']['Row'];
type Property = Database['public']['Tables']['properties']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

export interface LeadScore {
  lead_id: string;
  score: number;
  factors: {
    engagement: number;
    budget_match: number;
    timing: number;
    communication: number;
    profile_completeness: number;
  };
  conversion_probability: number;
  insights: string[];
}

export interface PropertyPriceSuggestion {
  property_id: string;
  suggested_price: number;
  confidence: number;
  factors: {
    location: number;
    features: number;
    market_trend: number;
    comparable_properties: number;
  };
  comparable_properties: Array<{
    id: string;
    title: string;
    price: number;
    similarity: number;
  }>;
}

export interface SentimentAnalysis {
  message_id: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  emotions: {
    joy: number;
    anger: number;
    sadness: number;
    fear: number;
    surprise: number;
  };
  intent: string;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
}

export interface PropertyRecommendation {
  lead_id: string;
  property_id: string;
  match_score: number;
  reasons: string[];
  property: Property;
}

// Hook para calcular score de leads
export function useCalculateLeadScore() {
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async (leadId: string): Promise<LeadScore> => {
      // Modo demo - retornar score mockado
      console.log('🎭 Modo demo: calculando score de lead mockado');
      
      const mockScore: LeadScore = {
        lead_id: leadId,
        score: Math.floor(Math.random() * 30) + 70, // Score entre 70-100
        factors: {
          engagement: Math.floor(Math.random() * 20) + 80,
          budget_match: Math.floor(Math.random() * 30) + 70,
          timing: Math.floor(Math.random() * 25) + 75,
          communication: Math.floor(Math.random() * 20) + 80,
          profile_completeness: Math.floor(Math.random() * 30) + 70
        },
        conversion_probability: Math.random() * 0.3 + 0.7, // 70-100%
        insights: [
          'Lead altamente engajado - priorize o atendimento',
          'Orçamento bem definido e compatível com o mercado',
          'Momento ideal para conversão - lead recente e ativo'
        ]
      };
      
      return mockScore;
    },
    onSuccess: (data) => {
      toast({
        title: 'Score calculado',
        description: `Score do lead: ${data.score}/100`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao calcular score',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}

// Hook para sugerir preço de imóvel
export function useSuggestPropertyPrice() {
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async (propertyId: string): Promise<PropertyPriceSuggestion> => {
      // Modo demo - retornar sugestão de preço mockada
      console.log('🎭 Modo demo: retornando sugestão de preço mockada');
      
      // Gerar dados mockados
      const basePrice = Math.floor(Math.random() * 500000) + 200000;
      const factors = {
        location: 1.2,
        features: 1.1,
        market_trend: 1.05,
        comparable_properties: 0.85
      };
      
      const suggested_price = basePrice * 
        (factors.location * 0.3 +
         factors.features * 0.3 +
         factors.market_trend * 0.2 +
         factors.comparable_properties * 0.2);
      
      return {
        property_id: propertyId,
        suggested_price: Math.floor(suggested_price),
        confidence: 0.85,
        factors,
        comparable_properties: [
          {
            id: 'prop-1',
            title: 'Apartamento Vista Mar',
            price: basePrice + 50000,
            similarity: 0.92
          },
          {
            id: 'prop-2',
            title: 'Cobertura Duplex',
            price: basePrice + 100000,
            similarity: 0.88
          },
          {
            id: 'prop-3',
            title: 'Apartamento Garden',
            price: basePrice - 30000,
            similarity: 0.85
          },
          {
            id: 'prop-4',
            title: 'Apartamento Térreo',
            price: basePrice - 50000,
            similarity: 0.82
          },
          {
            id: 'prop-5',
            title: 'Apartamento Cobertura',
            price: basePrice + 150000,
            similarity: 0.79
          }
        ]
      };
    }
  });
}

// Hook para análise de sentimento
export function useAnalyzeSentiment() {
  const { account } = useAccount();
  
  return useMutation({
    mutationFn: async (messageId: string): Promise<SentimentAnalysis> => {
      // Modo demo - retornar análise mockada
      console.log('🎭 Modo demo: retornando análise de sentimento mockada');
      
      // Gerar análise mockada
      const sentiments: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'negative', 'neutral'];
      const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      
      return {
        message_id: messageId,
        sentiment: randomSentiment,
        score: randomSentiment === 'positive' ? 0.8 : randomSentiment === 'negative' ? -0.6 : 0.1,
        emotions: {
          joy: Math.random() * 0.5,
          anger: Math.random() * 0.3,
          sadness: Math.random() * 0.2,
          fear: Math.random() * 0.1,
          surprise: Math.random() * 0.4
        },
        intent: Math.random() > 0.5 ? 'schedule_visit' : 'price_inquiry',
        entities: [
          {
            type: 'location',
            value: 'São Paulo',
            confidence: 0.95
          },
          {
            type: 'price_range',
            value: '300k-500k',
            confidence: 0.87
          }
        ]
      };
    }
  });
}

// Hook para recomendar imóveis
export function useRecommendProperties() {
  const { account } = useAccount();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leadId: string): Promise<PropertyRecommendation[]> => {
      if (!account?.id) throw new Error('Conta não encontrada');
      
      try {
        const response = await fetch('/api/ai/property-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ leadId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao gerar recomendações');
        }

        const data = await response.json();
        return data.recommendations;
      } catch (error: any) {
        console.error('Erro ao recomendar imóveis:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-recommendations'] });
      toast({
        title: 'Recomendações geradas',
        description: 'As recomendações foram atualizadas com sucesso',
      });
    }
  });
}

// Hook para buscar recomendações existentes
export function usePropertyRecommendations(leadId?: string) {
  const { account } = useAccount();
  
  return useQuery({
    queryKey: ['property-recommendations', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      // Modo demo - retornar recomendações mockadas
      console.log('🎭 Modo demo: retornando recomendações de imóveis mockadas para lead', leadId);
      
      const mockRecommendations = [];
      const propertyTitles = [
        'Apartamento Moderno com Vista Mar',
        'Casa Espaçosa com Jardim',
        'Cobertura de Luxo',
        'Studio Bem Localizado',
        'Loft Industrial',
        'Casa de Condomínio',
        'Apartamento Familiar'
      ];
      const neighborhoods = ['Centro', 'Copacabana', 'Ipanema', 'Vila Madalena', 'Pinheiros', 'Moema', 'Itaim Bibi'];
      const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'];
      const types = ['apartment', 'house', 'commercial'];
      const purposes = ['sale', 'rent'];
      
      for (let i = 0; i < 5; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const purpose = purposes[Math.floor(Math.random() * purposes.length)];
        const matchScore = Math.random() * 0.4 + 0.6; // 60-100%
        
        // Preços baseados no tipo e finalidade
        let price;
        if (purpose === 'sale') {
          price = type === 'apartment' ? Math.floor(Math.random() * 600000) + 400000 :
                 type === 'house' ? Math.floor(Math.random() * 1000000) + 600000 :
                 Math.floor(Math.random() * 1200000) + 500000; // comercial
        } else {
          price = type === 'apartment' ? Math.floor(Math.random() * 2500) + 1500 :
                 type === 'house' ? Math.floor(Math.random() * 4000) + 3000 :
                 Math.floor(Math.random() * 6000) + 3500; // comercial
        }
        
        const reasons = [];
        if (matchScore > 0.8) {
          reasons.push('Dentro do orçamento', 'Localização preferida');
        }
        if (matchScore > 0.7) {
          reasons.push('Características desejadas');
        }
        reasons.push('Boa oportunidade');
        
        mockRecommendations.push({
          id: `rec-${i + 1}`,
          lead_id: leadId,
          match_score: matchScore,
          shown: i > 2 ? Math.random() > 0.5 : false, // Algumas já foram mostradas
          reasons,
          created_at: new Date().toISOString(),
          property: {
            id: `property-${i + 1}`,
            title: propertyTitles[i],
            neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
            city: cities[Math.floor(Math.random() * cities.length)],
            type,
            purpose,
            bedrooms: type === 'commercial' ? 0 : Math.floor(Math.random() * 4) + 1,
            bathrooms: type === 'commercial' ? 0 : Math.floor(Math.random() * 3) + 1,
            total_area: Math.floor(Math.random() * 200) + 50,
            sale_price: purpose === 'sale' ? price : null,
            rent_price: purpose === 'rent' ? price : null,
            images: [`https://picsum.photos/400/300?random=${i + 1}`]
          }
        });
      }
      
      return mockRecommendations.sort((a, b) => b.match_score - a.match_score);
    },
    enabled: !!leadId // Habilitado quando um lead está selecionado
  });
}

// Funções auxiliares
function calculateEngagementScore(behaviors: any[], interactions: any[]): number {
  if (behaviors.length === 0) return 50;
  
  const avgEngagement = behaviors.reduce((sum, b) => sum + (b.engagement_score || 0), 0) / behaviors.length;
  const interactionBonus = Math.min(interactions.length * 5, 30);
  
  return Math.min(avgEngagement + interactionBonus, 100);
}

function calculateBudgetScore(lead: Lead): number {
  if (!lead.budget_max || !lead.budget_min) return 50;
  
  // Score mais alto para orçamentos maiores e mais definidos
  const budgetRange = lead.budget_max - lead.budget_min;
  const avgBudget = (lead.budget_max + lead.budget_min) / 2;
  
  let score = 50;
  if (avgBudget > 1000000) score += 30;
  else if (avgBudget > 500000) score += 20;
  else if (avgBudget > 300000) score += 10;
  
  // Bonus para range bem definido
  if (budgetRange / avgBudget < 0.3) score += 20;
  
  return Math.min(score, 100);
}

function calculateTimingScore(lead: Lead, interactions: any[]): number {
  const now = Date.now();
  const daysSinceCreation = Math.floor((now - new Date(lead.created_at || now).getTime()) / (1000 * 60 * 60 * 24));
  const recentInteractions = interactions.filter(i => {
    const daysAgo = Math.floor((now - new Date(i.created_at || now).getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo <= 7;
  });
  
  let score = 50;
  
  // Leads novos são mais quentes
  if (daysSinceCreation <= 3) score += 30;
  else if (daysSinceCreation <= 7) score += 20;
  else if (daysSinceCreation <= 14) score += 10;
  else if (daysSinceCreation > 30) score -= 20;
  
  // Interações recentes aumentam o score
  score += Math.min(recentInteractions.length * 10, 40);
  
  return Math.max(Math.min(score, 100), 0);
}

function calculateCommunicationScore(lead: Lead, interactions: any[]): number {
  let score = 50;
  
  // Canais de contato disponíveis
  if (lead.email) score += 10;
  if (lead.whatsapp || lead.phone) score += 20;
  
  // Frequência de comunicação
  const totalInteractions = interactions.length;
  score += Math.min(totalInteractions * 5, 30);
  
  return Math.min(score, 100);
}

function calculateProfileScore(lead: Lead): number {
  let score = 0;
  const fields = [
    lead.name,
    lead.email,
    lead.phone,
    lead.city,
    lead.profession,
    lead.income_range,
    lead.property_types && lead.property_types.length > 0,
    lead.budget_min,
    lead.budget_max,
    lead.desired_features
  ];
  
  fields.forEach(field => {
    if (field) score += 10;
  });
  
  return score;
}

function generateLeadInsights(lead: Lead, factors: any): string[] {
  const insights = [];
  
  if (factors.engagement > 80) {
    insights.push('Lead altamente engajado - priorize o atendimento');
  } else if (factors.engagement < 30) {
    insights.push('Baixo engajamento - considere uma abordagem diferente');
  }
  
  if (factors.budget_match > 80) {
    insights.push('Orçamento bem definido e compatível com o mercado');
  }
  
  if (factors.timing > 80) {
    insights.push('Momento ideal para conversão - lead recente e ativo');
  } else if (factors.timing < 30) {
    insights.push('Lead frio - pode precisar de nutrição');
  }
  
  if (factors.profile_completeness < 50) {
    insights.push('Perfil incompleto - colete mais informações');
  }
  
  return insights;
}

function calculateLocationFactor(property: Property): number {
  // Simplificado - em produção usaria dados de mercado
  const premiumNeighborhoods = ['Vila Olímpia', 'Itaim Bibi', 'Jardins', 'Leblon', 'Ipanema'];
  
  if (property.neighborhood && premiumNeighborhoods.some(n => 
    property.neighborhood?.toLowerCase().includes(n.toLowerCase())
  )) {
    return 1.2;
  }
  
  return 1.0;
}

function calculateFeaturesFactor(property: Property): number {
  let factor = 1.0;
  
  if (property.amenities && Array.isArray(property.amenities)) {
    factor += property.amenities.length * 0.02;
  }
  
  if (property.parking_spaces && property.parking_spaces > 2) factor += 0.1;
  if (property.suites && property.suites > 0) factor += 0.1;
  
  return Math.min(factor, 1.5);
}

function calculateMarketTrend(): number {
  // Simplificado - em produção usaria dados reais
  return 1.05; // Mercado em alta de 5%
}

function analyzeSentimentFromText(text: string): { sentiment: 'positive' | 'negative' | 'neutral'; score: number } {
  // Análise simplificada - em produção usaria OpenAI
  const positiveWords = ['adorei', 'perfeito', 'excelente', 'ótimo', 'maravilhoso', 'incrível', 'bom', 'gostei'];
  const negativeWords = ['ruim', 'péssimo', 'horrível', 'caro', 'não gostei', 'problema', 'defeito'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 1;
  });
  
  if (score > 0) return { sentiment: 'positive', score: Math.min(score / 3, 1) };
  if (score < 0) return { sentiment: 'negative', score: Math.max(score / 3, -1) };
  return { sentiment: 'neutral', score: 0 };
}

function analyzeEmotions(text: string): any {
  // Simplificado
  return {
    joy: 0.3,
    anger: 0.1,
    sadness: 0.1,
    fear: 0.1,
    surprise: 0.4
  };
}

function detectIntent(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('agendar') || lowerText.includes('visita')) return 'schedule_visit';
  if (lowerText.includes('preço') || lowerText.includes('valor')) return 'price_inquiry';
  if (lowerText.includes('disponível') || lowerText.includes('disponibilidade')) return 'availability_check';
  if (lowerText.includes('foto') || lowerText.includes('imagem')) return 'media_request';
  
  return 'general_inquiry';
}

function extractEntities(text: string): any[] {
  const entities = [];
  
  // Detecção simplificada de valores monetários
  const priceMatch = text.match(/R\$\s*(\d+\.?\d*)/);
  if (priceMatch) {
    entities.push({
      type: 'money',
      value: priceMatch[1],
      confidence: 0.9
    });
  }
  
  // Detecção de números de quartos
  const bedroomMatch = text.match(/(\d+)\s*quarto/i);
  if (bedroomMatch) {
    entities.push({
      type: 'bedrooms',
      value: bedroomMatch[1],
      confidence: 0.8
    });
  }
  
  return entities;
}

function calculatePropertyMatch(lead: Lead, property: Property): { score: number; reasons: string[] } {
  let score = 0;
  const reasons = [];
  
  // Match de orçamento
  if (lead.budget_min && lead.budget_max) {
    const price = property.purpose === 'rent' ? property.rent_price : property.sale_price;
    if (price && price >= lead.budget_min && price <= lead.budget_max) {
      score += 0.3;
      reasons.push('Preço dentro do orçamento');
    } else if (price && price < lead.budget_min * 1.2) {
      score += 0.15;
      reasons.push('Preço próximo ao orçamento');
    }
  }
  
  // Match de tipo
  if (lead.property_types && property.type && lead.property_types.includes(property.type)) {
    score += 0.2;
    reasons.push('Tipo de imóvel desejado');
  }
  
  // Match de localização
  if (lead.desired_locations && property.neighborhood) {
    const locations = lead.desired_locations as any;
    if (locations.neighborhoods?.includes(property.neighborhood)) {
      score += 0.25;
      reasons.push('Localização desejada');
    }
  } else if (lead.neighborhood === property.neighborhood) {
    score += 0.2;
    reasons.push('Mesma região de interesse');
  }
  
  // Match de características
  if (property.bedrooms && lead.desired_features) {
    const features = lead.desired_features as any;
    if (features.min_bedrooms && property.bedrooms >= features.min_bedrooms) {
      score += 0.15;
      reasons.push('Número de quartos adequado');
    }
  }
  
  // Bonus por qualidade do imóvel
  if (property.images && Array.isArray(property.images) && property.images.length > 5) {
    score += 0.1;
    reasons.push('Imóvel bem documentado');
  }
  
  return { score: Math.min(score, 1), reasons };
}