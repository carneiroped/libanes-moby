'use client';

import { useQuery } from '@tanstack/react-query';
import { azureClient } from '@/lib/azure-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Zap, 
  Users, 
  Activity,
  ArrowUp,
  ArrowDown,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAccount } from '@/hooks/useAccount';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Database } from '@/types/database.types';
import { cn } from '@/lib/utils';

type Lead = Database['public']['Tables']['leads']['Row'];

interface LeadWithChange extends Lead {
  previous_score?: number;
  score_change?: number;
}

export function LeadScoringWidget() {
  const router = useRouter();
  const supabase = azureClient as any;
  const { account } = useAccount();
  
  // Buscar estatísticas gerais
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['lead-scoring-stats', account?.id],
    queryFn: async () => {
      if (!account?.id) return null;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Buscar todos os leads ativos
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('account_id', account.id)
        .not('status', 'in', '("converted","lost")');
      
      if (error) throw error;
      
      const activeLeads = leads || [];
      
      // Calcular estatísticas
      const hotLeads = activeLeads.filter((l: any) => l.classification === 'hot');
      const warmLeads = activeLeads.filter((l: any) => l.classification === 'warm');
      const coldLeads = activeLeads.filter((l: any) => l.classification === 'cold');

      // Leads quentes de hoje
      const todayHotLeads = hotLeads.filter((l: any) =>
        new Date(l.score_updated_at || l.updated_at) >= today
      );
      
      // Taxa de conversão por faixa
      const { data: conversions } = await supabase
        .from('leads')
        .select('classification, status')
        .eq('account_id', account.id)
        .eq('status', 'converted')
        .not('classification', 'is', null);
      
      const conversionRates = {
        hot: 0,
        warm: 0,
        cold: 0
      };
      
      if (conversions) {
        const hotConverted = conversions.filter((c: any) => c.classification === 'hot').length;
        const warmConverted = conversions.filter((c: any) => c.classification === 'warm').length;
        const coldConverted = conversions.filter((c: any) => c.classification === 'cold').length;
        
        conversionRates.hot = hotLeads.length > 0 
          ? Math.round((hotConverted / (hotLeads.length + hotConverted)) * 100)
          : 0;
        conversionRates.warm = warmLeads.length > 0
          ? Math.round((warmConverted / (warmLeads.length + warmConverted)) * 100)
          : 0;
        conversionRates.cold = coldLeads.length > 0
          ? Math.round((coldConverted / (coldLeads.length + coldConverted)) * 100)
          : 0;
      }
      
      return {
        totalActive: activeLeads.length,
        hotCount: hotLeads.length,
        warmCount: warmLeads.length,
        coldCount: coldLeads.length,
        todayHotCount: todayHotLeads.length,
        averageScore: activeLeads.length > 0
          ? Math.round(activeLeads.reduce((sum: number, l: any) => sum + (l.score || 0), 0) / activeLeads.length)
          : 0,
        conversionRates
      };
    },
    enabled: !!account?.id,
    refetchInterval: 60000 // Refetch a cada minuto
  });
  
  // Buscar leads com mudanças significativas
  const { data: changedLeads, isLoading: changesLoading } = useQuery({
    queryKey: ['lead-score-changes', account?.id],
    queryFn: async () => {
      if (!account?.id) return [];
      
      // Buscar notificações recentes de mudanças significativas
      const { data: notifications, error } = await supabase
        .from('lead_score_notifications')
        .select(`
          *,
          leads!inner(*)
        `)
        .eq('account_id', account.id)
        .in('notification_type', ['significant_increase', 'significant_decrease'])
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return (notifications || []).map((n: any) => ({
        ...n.leads,
        previous_score: n.old_score,
        score_change: n.score_change,
        change_date: n.created_at
      })) as LeadWithChange[];
    },
    enabled: !!account?.id
  });
  
  // Buscar top leads quentes
  const { data: topHotLeads, isLoading: hotLeadsLoading } = useQuery({
    queryKey: ['top-hot-leads', account?.id],
    queryFn: async () => {
      if (!account?.id) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('account_id', account.id)
        .eq('classification', 'hot')
        .not('status', 'in', '("converted","lost")')
        .order('score', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!account?.id
  });
  
  const isLoading = statsLoading || changesLoading || hotLeadsLoading;
  
  const handleRefresh = async () => {
    await Promise.all([
      refetchStats(),
      // Poderia chamar a Edge Function aqui para recalcular todos os scores
    ]);
  };
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lead Scoring</CardTitle>
            <CardDescription>
              Acompanhamento automático de score e classificação de leads
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Métricas Principais */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Leads Ativos</p>
            <p className="text-2xl font-bold">{stats?.totalActive || 0}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Leads Quentes</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-yellow-600">{stats?.hotCount || 0}</p>
              {stats?.todayHotCount ? (
                <Badge variant="outline" className="text-xs">
                  +{stats.todayHotCount} hoje
                </Badge>
              ) : null}
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Score Médio</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{stats?.averageScore || 0}</p>
              <Progress value={stats?.averageScore || 0} className="w-16 h-2" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Taxa Conversão (Hot)</p>
            <p className="text-2xl font-bold text-green-600">
              {stats?.conversionRates.hot || 0}%
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="hot-leads" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hot-leads">
              <Zap className="h-4 w-4 mr-2" />
              Leads Quentes
            </TabsTrigger>
            <TabsTrigger value="changes">
              <Activity className="h-4 w-4 mr-2" />
              Mudanças Recentes
            </TabsTrigger>
            <TabsTrigger value="distribution">
              <Users className="h-4 w-4 mr-2" />
              Distribuição
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hot-leads" className="space-y-3">
            {topHotLeads?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum lead quente no momento
              </p>
            ) : (
              topHotLeads?.map((lead: any) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/leads/${lead.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold">{lead.score}/100</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.score_updated_at || lead.updated_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="changes" className="space-y-3">
            {changedLeads?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma mudança significativa recente
              </p>
            ) : (
              changedLeads?.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/leads/${lead.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{lead.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={(lead as any).classification === 'hot' ? 'default' : 'secondary'}>
                        {(lead as any).classification || 'medium'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {lead.previous_score} → {lead.score}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(lead.score_change || 0) > 0 ? (
                      <>
                        <ArrowUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          +{lead.score_change}
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 font-medium">
                          {lead.score_change}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="distribution" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Quentes ({stats?.hotCount || 0})</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats?.totalActive ? Math.round((stats.hotCount / stats.totalActive) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={stats?.totalActive ? (stats.hotCount / stats.totalActive) * 100 : 0}
                className="h-2"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm">Mornos ({stats?.warmCount || 0})</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats?.totalActive ? Math.round((stats.warmCount / stats.totalActive) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={stats?.totalActive ? (stats.warmCount / stats.totalActive) * 100 : 0}
                className="h-2"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Frios ({stats?.coldCount || 0})</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats?.totalActive ? Math.round((stats.coldCount / stats.totalActive) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={stats?.totalActive ? (stats.coldCount / stats.totalActive) * 100 : 0}
                className="h-2"
              />
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Taxa de Conversão por Classificação</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Quentes</span>
                  <span className="font-medium text-green-600">{stats?.conversionRates.hot || 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Mornos</span>
                  <span className="font-medium text-orange-600">{stats?.conversionRates.warm || 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Frios</span>
                  <span className="font-medium text-blue-600">{stats?.conversionRates.cold || 0}%</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/admin/ai/lead-scoring')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Painel Completo de Scoring
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}