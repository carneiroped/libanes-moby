'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Building,
  MessageSquare,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  UserCircle,
  Bot,
  BarChart,
  CalendarDays,
  RefreshCw,
  Plus,
  Eye,
  Loader2
} from "lucide-react";
import { useDashboardMetrics } from '@/hooks/useDashboard';
import { cn } from '@/lib/utils';
import { AgendaWidget } from '@/components/admin/dashboard/AgendaWidget';

// MetricCard simplificado
interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  previousPeriod?: number;
  loading?: boolean;
  primary?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

const MetricCard = ({
  title,
  value,
  description,
  icon,
  trend,
  previousPeriod,
  loading = false,
  primary = false,
  clickable = false,
  onClick,
  className
}: MetricCardProps) => {
  const renderTrend = () => {
    if (trend === undefined || trend === 0) return null;

    const isPositive = trend > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const trendColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

    return (
      <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
        <TrendIcon size={14} />
        <span className="text-xs font-medium">
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-muted-foreground">vs mês anterior</span>
      </div>
    );
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        primary && "ring-2 ring-primary/20",
        clickable && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={clickable ? onClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          "rounded-full flex items-center justify-center",
          primary ? "h-10 w-10 bg-primary/10 text-primary" : "h-8 w-8 bg-muted text-muted-foreground"
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted"></div>
            <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
          </div>
        ) : (
          <div>
            <div className={cn(
              "font-bold",
              primary ? "text-3xl" : "text-2xl"
            )}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
            {renderTrend()}
            {previousPeriod !== undefined && previousPeriod > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Mês anterior: {previousPeriod.toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        )}
        {clickable && !loading && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center text-xs text-primary">
              <Eye size={12} className="mr-1" />
              Ver detalhes
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Quick actions
const QuickActions = () => {
  const quickActions = [
    { label: 'Novo Lead', icon: <Plus size={16} />, href: '/admin/leads/new' },
    { label: 'Novo Imóvel', icon: <Building size={16} />, href: '/admin/imoveis/novo' },
    { label: 'Moby IA', icon: <Bot size={16} />, href: '/admin/moby' },
    { label: 'Analytics', icon: <BarChart size={16} />, href: '/admin/analytics' },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {quickActions.map((action, index) => (
        <Link key={index} href={action.href}>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            {action.icon}
            {action.label}
          </Button>
        </Link>
      ))}
    </div>
  );
};

// Module Card
interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const ModuleCard = ({ title, description, icon, href, badge }: ModuleCardProps) => {
  return (
    <Link href={href}>
      <Card className="transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// Formato de data
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: metrics, isLoading, error, refetch } = useDashboardMetrics();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Handle metric card click
  const handleMetricClick = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  // Primary metrics
  const primaryMetrics = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        key: 'totalLeads',
        title: 'Leads Ativos',
        value: metrics.totalLeads,
        description: `${metrics.leadsNovos} novos, ${metrics.leadsAtivos} em atendimento`,
        icon: <UserCircle size={20} />,
        trend: metrics.trends.totalLeads,
        previousPeriod: metrics.previousPeriod.totalLeads,
        onClick: () => handleMetricClick('/admin/leads'),
      },
      {
        key: 'totalImoveis',
        title: 'Imóveis Cadastrados',
        value: metrics.totalImoveis,
        description: 'Imóveis disponíveis no portfólio',
        icon: <Building size={20} />,
        onClick: () => handleMetricClick('/admin/imoveis'),
      },
    ];
  }, [metrics, handleMetricClick]);

  // Secondary metrics
  const secondaryMetrics = useMemo(() => {
    if (!metrics) return [];

    return [
      {
        key: 'totalChats',
        title: 'Conversas Ativas',
        value: metrics.chatsAtivos,
        description: `${metrics.totalChats} conversas totais`,
        icon: <MessageSquare size={18} />,
        onClick: () => handleMetricClick('/admin/chats'),
      },
      {
        key: 'conversionRate',
        title: 'Taxa de Conversão',
        value: `${metrics.conversionRate}%`,
        description: `${metrics.leadsConvertidos} leads convertidos`,
        icon: <TrendingUp size={18} />,
      },
    ];
  }, [metrics, handleMetricClick]);

  const today = new Date();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive">Erro ao carregar dados do dashboard</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw size={16} className="mr-2" />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(today)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-xs">
            Dados em tempo real
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-medium">Ações Rápidas</h3>
              <p className="text-sm text-muted-foreground">Acesse as funcionalidades principais</p>
            </div>
            <QuickActions />
          </div>
        </CardContent>
      </Card>

      {/* Primary Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Indicadores Principais</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {primaryMetrics.map((metric) => (
            <MetricCard
              key={metric.key}
              title={metric.title}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
              trend={metric.trend}
              previousPeriod={metric.previousPeriod}
              onClick={metric.onClick}
              primary
              clickable
              loading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Métricas Adicionais</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {secondaryMetrics.map((metric) => (
            <MetricCard
              key={metric.key}
              title={metric.title}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
              onClick={metric.onClick}
              clickable={!!metric.onClick}
              loading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Agenda do Dia */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Agenda de Hoje</h2>
        <AgendaWidget />
      </div>

      {/* Módulos do Sistema */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Módulos do Sistema</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ModuleCard
            title="Gestão de Leads"
            description="Pipeline completo com follow-ups e indicadores"
            icon={<UserCircle size={20} />}
            href="/admin/leads"
            badge="Essencial"
          />

          <ModuleCard
            title="Imóveis"
            description="Cadastre e gerencie seu portfólio"
            icon={<Building size={20} />}
            href="/admin/imoveis"
            badge="Essencial"
          />

          <ModuleCard
            title="Conversas"
            description="WhatsApp e histórico de mensagens"
            icon={<MessageSquare size={20} />}
            href="/admin/chats"
          />

          <ModuleCard
            title="Moby IA"
            description="Assistente inteligente e gerador de conteúdo"
            icon={<Bot size={20} />}
            href="/admin/moby"
            badge="IA"
          />

          <ModuleCard
            title="Analytics"
            description="Relatórios detalhados e análises"
            icon={<BarChart size={20} />}
            href="/admin/analytics"
          />

          <ModuleCard
            title="Calendário"
            description="Agenda e compromissos"
            icon={<CalendarDays size={20} />}
            href="/admin/calendario"
          />
        </div>
      </div>
    </div>
  );
}
