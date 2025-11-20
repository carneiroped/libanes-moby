'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  Search,
  Filter,
  Users,
  TrendingUp,
  Target,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useKanbanLeads, useMoveLeadStage, usePipelineStages } from '@/hooks/useKanban';
import { PipelineKanbanBoard } from '@/components/pipeline/PipelineKanbanBoard';
import { PIPELINE_STAGES } from '@/lib/config/pipeline-stages';

/**
 * Página do Kanban - Sistema Simplificado
 *
 * Estágios fixos do funil imobiliário:
 * Lead Novo → Qualificação → Apresentação → Visita Agendada → Proposta → Documentação → Fechamento
 */
export default function KanbanPage() {
  const router = useRouter();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hooks
  const { data: kanbanData, isLoading, refetch } = useKanbanLeads();
  const moveLeadMutation = useMoveLeadStage();
  const { data: stages } = usePipelineStages();

  // Leads filtrados
  const filteredLeads = useMemo(() => {
    if (!kanbanData?.leads) return [];

    let result = kanbanData.leads;

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((lead: any) =>
        lead.name?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.phone?.includes(term)
      );
    }

    // Filtro de responsável
    if (filterAssignee !== 'all') {
      result = result.filter((lead: any) => lead.assigned_to === filterAssignee);
    }

    return result;
  }, [kanbanData?.leads, searchTerm, filterAssignee]);

  // Métricas
  const metrics = useMemo(() => {
    const totalLeads = filteredLeads.length;
    const closedLeads = filteredLeads.filter((l: any) => l.stage === 'fechamento').length;
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      closedLeads,
      conversionRate,
    };
  }, [filteredLeads]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: 'Kanban atualizado',
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
  }, [refetch]);

  const handleLeadMove = useCallback(
    async (leadId: string, targetStageId: string) => {
      await moveLeadMutation.mutateAsync({
        leadId,
        newStage: targetStageId as any,
      });
    },
    [moveLeadMutation]
  );

  const handleLeadClick = useCallback(
    (lead: any) => {
      router.push(`/admin/leads/${lead.id}`);
    },
    [router]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kanban de Vendas</h1>
          <p className="text-muted-foreground">
            Funil otimizado para conversão de leads em vendas imobiliárias
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
          <Button onClick={() => router.push('/admin/leads/new')}>
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              em {stages.length} estágios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fechados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.closedLeads}</div>
            <p className="text-xs text-muted-foreground">
              vendas concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              leads → fechamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estágios</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stages.length}</div>
            <p className="text-xs text-muted-foreground">
              funil otimizado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <PipelineKanbanBoard
        pipeline={{
          id: 'fixed',
          name: 'Pipeline Imobiliário',
          stages: PIPELINE_STAGES.map(s => ({
            id: s.id,
            name: s.name,
            color: s.color,
            order: s.order,
          })),
        }}
        leads={filteredLeads}
        onLeadMove={handleLeadMove}
        onLeadClick={handleLeadClick}
        onRefresh={handleRefresh}
        isLoading={isRefreshing || moveLeadMutation.isPending}
      />
    </div>
  );
}
