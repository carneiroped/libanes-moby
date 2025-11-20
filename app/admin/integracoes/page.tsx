'use client';

/**
 * HUB CENTRALIZADO DE INTEGRAÇÕES
 *
 * Gerenciamento de todas as integrações de leads do sistema
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Zap,
  Home,
  Key,
  Search,
  Facebook,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings,
  ExternalLink,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useIntegrationsHub } from '@/hooks/useIntegrationsHub';

// =====================================================
// TIPOS
// =====================================================

type IntegrationStatus = 'active' | 'pending' | 'coming_soon' | 'inactive';

interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: IntegrationStatus;
  stats?: {
    totalLeads?: number;
    leadsToday?: number;
    leadsThisMonth?: number;
  };
  features: string[];
  configUrl?: string;
  docsUrl?: string;
  category: 'portals' | 'ads' | 'other';
}

// =====================================================
// DADOS DAS INTEGRAÇÕES
// =====================================================

const integrations: IntegrationCard[] = [
  // PORTAIS IMOBILIÁRIOS
  {
    id: 'olx-zap',
    name: 'Grupo OLX/ZAP',
    description: 'ZAP Imóveis, Viva Real e OLX Imóveis',
    icon: <Zap className="h-6 w-6" />,
    status: 'active',
    stats: {
      totalLeads: 0,
      leadsToday: 0,
      leadsThisMonth: 0,
    },
    features: [
      'Leads em tempo real',
      '3 portais em 1',
      'Deduplicação automática',
      'Priorização por temperatura',
    ],
    configUrl: '/admin/integracoes/olx-zap',
    category: 'portals',
  },
  {
    id: 'chaves-na-mao',
    name: 'Chaves na Mão',
    description: 'Portal nacional de classificados imobiliários',
    icon: <Key className="h-6 w-6" />,
    status: 'pending',
    features: [
      'Leads em tempo real',
      'Alcance nacional',
      'Integração via webhook',
      'XML de imóveis',
    ],
    category: 'portals',
  },
  {
    id: 'imoveis-sc',
    name: 'Imóveis SC',
    description: 'Portal regional de Santa Catarina',
    icon: <Home className="h-6 w-6" />,
    status: 'pending',
    features: [
      'Foco em Santa Catarina',
      '100mil+ imóveis',
      'Leads qualificados',
      'Mercado regional',
    ],
    category: 'portals',
  },

  // ANÚNCIOS PAGOS
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Leads de campanhas do Google (Search, Display, YouTube)',
    icon: <Search className="h-6 w-6" />,
    status: 'coming_soon',
    features: [
      'Google Lead Form',
      'Conversões de anúncios',
      'Rastreamento automático',
      'ROI em tempo real',
    ],
    category: 'ads',
  },
  {
    id: 'meta-ads',
    name: 'Meta Ads',
    description: 'Leads do Facebook e Instagram',
    icon: <Facebook className="h-6 w-6" />,
    status: 'coming_soon',
    features: [
      'Facebook Lead Ads',
      'Instagram Lead Forms',
      'Público segmentado',
      'Métricas de campanha',
    ],
    category: 'ads',
  },
];

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function IntegrationsHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Buscar estatísticas reais de todas as integrações
  const { stats, totalStats, isLoading, error, refetch } = useIntegrationsHub();

  // Atualizar dados das integrações com estatísticas reais
  const integrationsWithStats: IntegrationCard[] = integrations.map(integration => {
    if (integration.id === 'olx-zap' && stats?.['olx-zap']) {
      return {
        ...integration,
        stats: {
          totalLeads: stats['olx-zap'].totalLeads,
          leadsToday: stats['olx-zap'].leadsToday,
          leadsThisMonth: stats['olx-zap'].leadsThisMonth,
        },
      };
    }
    return integration;
  });

  // Filtrar integrações por categoria
  const filteredIntegrations = selectedCategory === 'all'
    ? integrationsWithStats
    : integrationsWithStats.filter(i => i.category === selectedCategory);

  // Estatísticas gerais
  const totalActive = integrations.filter(i => i.status === 'active').length;
  const totalPending = integrations.filter(i => i.status === 'pending').length;
  const totalComingSoon = integrations.filter(i => i.status === 'coming_soon').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as suas integrações de leads em um só lugar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
          <Badge variant="default" className="bg-green-500">
            {totalActive} Ativa{totalActive !== 1 ? 's' : ''}
          </Badge>
          {totalPending > 0 && (
            <Badge variant="secondary">
              {totalPending} Pendente{totalPending !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Leads
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">...</div>
            ) : (
              <div className="text-2xl font-bold">{totalStats.totalLeads}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Recebidos de todas as fontes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Integrações Ativas
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.activeIntegrations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Funcionando e recebendo leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Hoje
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">...</div>
            ) : (
              <div className="text-2xl font-bold">{totalStats.leadsToday}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Recebidos nas últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads este Mês
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">...</div>
            ) : (
              <div className="text-2xl font-bold">{totalStats.leadsThisMonth}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Total do mês atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros por Categoria */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          Todas
        </Button>
        <Button
          variant={selectedCategory === 'portals' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('portals')}
        >
          <Home className="h-4 w-4 mr-2" />
          Portais Imobiliários
        </Button>
        <Button
          variant={selectedCategory === 'ads' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('ads')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Anúncios Pagos
        </Button>
      </div>

      {/* Grid de Integrações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <IntegrationCardComponent key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  );
}

// =====================================================
// COMPONENTE DO CARD DE INTEGRAÇÃO
// =====================================================

function IntegrationCardComponent({ integration }: { integration: IntegrationCard }) {
  const getStatusBadge = () => {
    switch (integration.status) {
      case 'active':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Ativa
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Em Homologação
          </Badge>
        );
      case 'coming_soon':
        return (
          <Badge variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            Em Breve
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Inativa
          </Badge>
        );
    }
  };

  const getCategoryBadge = () => {
    switch (integration.category) {
      case 'portals':
        return <Badge variant="outline">Portal Imobiliário</Badge>;
      case 'ads':
        return <Badge variant="outline">Anúncios Pagos</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            integration.status === 'active'
              ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
              : integration.status === 'pending'
              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          )}>
            {integration.icon}
          </div>

          <div className="flex flex-col items-end gap-1">
            {getStatusBadge()}
          </div>
        </div>

        <div className="mt-4">
          <CardTitle className="text-xl">{integration.name}</CardTitle>
          <CardDescription className="mt-1">
            {integration.description}
          </CardDescription>
        </div>

        <div className="mt-2">
          {getCategoryBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estatísticas (se ativa) */}
        {integration.status === 'active' && integration.stats && (
          <div className="grid grid-cols-3 gap-2 p-3 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold">{integration.stats.totalLeads || 0}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{integration.stats.leadsToday || 0}</div>
              <div className="text-xs text-muted-foreground">Hoje</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{integration.stats.leadsThisMonth || 0}</div>
              <div className="text-xs text-muted-foreground">Mês</div>
            </div>
          </div>
        )}

        {/* Features */}
        <div>
          <p className="text-sm font-medium mb-2">Recursos:</p>
          <ul className="space-y-1">
            {integration.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {integration.status === 'active' && integration.configUrl ? (
            <Button asChild className="flex-1">
              <Link href={integration.configUrl}>
                <Settings className="h-4 w-4 mr-2" />
                Gerenciar
              </Link>
            </Button>
          ) : integration.status === 'pending' ? (
            <Button variant="outline" className="flex-1" disabled>
              <Clock className="h-4 w-4 mr-2" />
              Aguardando
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              Em Breve
            </Button>
          )}

          {integration.docsUrl && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={integration.docsUrl} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
