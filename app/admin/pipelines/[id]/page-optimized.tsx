'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Filter,
  Search,
  Download,
  Settings,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  BarChart3,
  Calendar,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers } from '@/hooks/useLeads';
import { 
  usePipelineOptimized, 
  usePipelineLeads,
  useOptimizedLeadMove,
  usePipelineAnalytics 
} from '@/hooks/usePipelineOptimized';
import { PipelineKanbanBoard } from '@/components/pipeline/PipelineKanbanBoard';

interface PipelineFilters {
  search: string;
  assignee: string;
  temperature: string;
  staleOnly: boolean;
  dateRange: string;
}

// Performance metrics component
const PipelineMetrics = ({ 
  pipeline, 
  leads, 
  analytics 
}: { 
  pipeline: any; 
  leads: any[]; 
  analytics: any;
}) => {
  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, lead) => sum + (Number(lead.budget_max) || 0), 0);
  const avgDealSize = totalLeads > 0 ? totalValue / totalLeads : 0;
  
  // Calculate conversion rate (first to last stage)
  const firstStageLeads = leads.filter(lead => 
    lead.stage_id === pipeline.sortedStages[0]?.id
  ).length;
  const lastStageLeads = leads.filter(lead => 
    lead.stage_id === pipeline.sortedStages[pipeline.sortedStages.length - 1]?.id
  ).length;
  const conversionRate = firstStageLeads > 0 ? (lastStageLeads / firstStageLeads) * 100 : 0;
  
  // Calculate average cycle time (simplified)
  const now = new Date();
  const avgCycleTime = leads.length > 0 
    ? leads.reduce((sum, lead) => {
        const createdAt = new Date(lead.created_at);
        const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + daysSinceCreated;
      }, 0) / leads.length
    : 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: value >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground">
            distribuídos em {pipeline.stageCount} estágios
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            potencial de negócios
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(avgDealSize)}
          </div>
          <p className="text-xs text-muted-foreground">
            valor médio por lead
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            {analytics.healthScore && (
              <Badge 
                variant="outline" 
                className={
                  analytics.healthScore >= 70 ? "text-green-600 bg-green-50" :
                  analytics.healthScore >= 40 ? "text-yellow-600 bg-yellow-50" :
                  "text-red-600 bg-red-50"
                }
              >
                {analytics.healthScore}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {lastStageLeads} convertidos • Ciclo: {Math.round(avgCycleTime)}d
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics dashboard component
const AnalyticsDashboard = ({ analytics, pipeline }: { analytics: any; pipeline: any }) => {
  if (!analytics) return null;
  
  return (
    <div className="space-y-6">
      {/* Bottlenecks Alert */}
      {analytics.bottlenecks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">
                Gargalos Identificados ({analytics.bottlenecks.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.bottlenecks.map((bottleneck: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{bottleneck.stageName}</span>
                  <Badge variant="outline" className="text-orange-600">
                    {bottleneck.conversionRate.toFixed(1)}% conversão
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Opportunities */}
      {analytics.opportunities.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">
                Oportunidades de Melhoria ({analytics.opportunities.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.opportunities.map((opportunity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{opportunity.stageName}</span>
                    <p className="text-sm text-muted-foreground">{opportunity.opportunity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        notation: 'compact',
                      }).format(opportunity.avgValue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {opportunity.velocity.toFixed(1)}/dia
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Indicadores de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Saúde Geral do Pipeline</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      analytics.healthScore >= 70 ? 'bg-green-500' :
                      analytics.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analytics.healthScore}%` }}
                  />
                </div>
                <span className="font-bold">{analytics.healthScore}/100</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(analytics.conversionRates).filter((rate: any) => rate > 60).length}
                </p>
                <p className="text-sm text-muted-foreground">Estágios saudáveis</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {analytics.bottlenecks.length}
                </p>
                <p className="text-sm text-muted-foreground">Gargalos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.opportunities.length}
                </p>
                <p className="text-sm text-muted-foreground">Oportunidades</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function OptimizedPipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = params.id as string;

  // State
  const [filters, setFilters] = useState<PipelineFilters>({
    search: '',
    assignee: 'all',
    temperature: 'all',
    staleOnly: false,
    dateRange: 'all',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('board');

  // Hooks
  const { 
    data: pipeline, 
    isLoading: pipelineLoading, 
    refetch: refetchPipeline 
  } = usePipelineOptimized(pipelineId);
  
  const { 
    data: leads = [], 
    isLoading: leadsLoading, 
    refetch: refetchLeads 
  } = usePipelineLeads(pipelineId, {
    search: filters.search || undefined,
    temperature: filters.temperature !== 'all' ? (filters.temperature as 'warm' | 'hot' | 'cold') : undefined,
  });
  
  const { data: users = [] } = useUsers();
  const leadMoveMutation = useOptimizedLeadMove(pipelineId);
  const analytics = usePipelineAnalytics(pipelineId);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    let result = leads;

    // Filter by assignee
    if (filters.assignee !== 'all') {
      result = result.filter((lead: any) => lead.assigned_to === filters.assignee);
    }

    // Filter stale leads only
    if (filters.staleOnly) {
      const now = new Date();
      result = result.filter((lead: any) => {
        const lastActivity = new Date(lead.last_contact_at || lead.updated_at || lead.created_at);
        return (now.getTime() - lastActivity.getTime()) > (14 * 24 * 60 * 60 * 1000);
      });
    }

    return result;
  }, [leads, filters]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchPipeline(), refetchLeads()]);
      toast({
        title: 'Pipeline atualizado',
        description: 'Os dados foram atualizados com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchPipeline, refetchLeads]);

  const handleLeadMove = useCallback(async (leadId: string, targetStageId: string) => {
    await leadMoveMutation.mutateAsync({ leadId, targetStageId });
  }, [leadMoveMutation]);

  const handleLeadClick = useCallback((lead: any) => {
    router.push(`/admin/leads/${lead.id}`);
  }, [router]);

  const handleFilterChange = useCallback((key: keyof PipelineFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  if (pipelineLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Pipeline não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/pipelines')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{pipeline.name}</h1>
            <p className="text-muted-foreground">
              Pipeline de vendas otimizado com análise em tempo real
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => router.push('/admin/leads/new')}>
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <PipelineMetrics 
        pipeline={pipeline} 
        leads={filteredLeads} 
        analytics={analytics} 
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filters.assignee} onValueChange={(value) => handleFilterChange('assignee', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os responsáveis</SelectItem>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.temperature} onValueChange={(value) => handleFilterChange('temperature', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Temperatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="hot">🔥 Quentes</SelectItem>
                <SelectItem value="warm">☀️ Mornos</SelectItem>
                <SelectItem value="cold">❄️ Frios</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={filters.staleOnly ? "default" : "outline"}
              onClick={() => handleFilterChange('staleOnly', !filters.staleOnly)}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Sem contato
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="board">Kanban Board</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-6">
          <PipelineKanbanBoard
            pipeline={pipeline}
            leads={filteredLeads}
            onLeadMove={handleLeadMove}
            onLeadClick={handleLeadClick}
            onRefresh={handleRefresh}
            isLoading={leadsLoading || isRefreshing}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard analytics={analytics} pipeline={pipeline} />
        </TabsContent>
      </Tabs>
    </div>
  );
}