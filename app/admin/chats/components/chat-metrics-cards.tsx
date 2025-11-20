'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, MessageCircle, Calendar, CalendarRange } from 'lucide-react';
import { ChatWithDetails } from '@/hooks/useChats';
import { useEffect, useState } from 'react';

interface ChatMetricsCardsProps {
  chats: ChatWithDetails[];
  isLoading?: boolean;
}

interface ChatMetrics {
  totalToday: number;
  activeChats: number;
  totalThisWeek: number;
  totalThisMonth: number;
}

export function ChatMetricsCards({ chats, isLoading }: ChatMetricsCardsProps) {
  const [metrics, setMetrics] = useState<ChatMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  
  useEffect(() => {
    const calculateMetrics = () => {
      try {
        setMetricsLoading(true);

        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);

        setMetrics({
          totalToday: chats.filter(chat => {
            if (!chat.updated_at) return false;
            const chatDate = new Date(chat.updated_at);
            return chatDate >= today;
          }).length,

          activeChats: chats.filter(chat => chat.status === 'active').length,

          totalThisWeek: chats.filter(chat => {
            if (!chat.updated_at) return false;
            const chatDate = new Date(chat.updated_at);
            return chatDate >= weekAgo;
          }).length,

          totalThisMonth: chats.filter(chat => {
            if (!chat.updated_at) return false;
            const chatDate = new Date(chat.updated_at);
            return chatDate >= monthAgo;
          }).length
        });
      } catch (error) {
        console.error('Error calculating chat metrics:', error);
        setMetrics({
          totalToday: 0,
          activeChats: 0,
          totalThisWeek: 0,
          totalThisMonth: 0
        });
      } finally {
        setMetricsLoading(false);
      }
    };

    if (!isLoading) {
      calculateMetrics();
    }
  }, [chats, isLoading]);

  const metricsConfig = [
    {
      title: 'Conversas Hoje',
      value: metrics?.totalToday || 0,
      icon: MessageSquare,
      description: 'Com atividade hoje',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Conversas Ativas',
      value: metrics?.activeChats || 0,
      icon: MessageCircle,
      description: 'Requerem atenção',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Conversas essa semana',
      value: metrics?.totalThisWeek || 0,
      icon: Calendar,
      description: 'Últimos 7 dias',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Conversas esse mês',
      value: metrics?.totalThisMonth || 0,
      icon: CalendarRange,
      description: 'Últimos 30 dias',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (isLoading || metricsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricsConfig.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`${metric.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${metric.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}