'use client';

import { useState, useEffect } from 'react';

interface MobileMetrics {
  salesData: {
    currentMonth: number;
    previousMonth: number;
    percentage: number;
    target: number;
  };
  leadsData: {
    total: number;
    new: number;
    hot: number;
    thisWeek: number;
  };
  performance: {
    salesGoal: {
      current: number;
      target: number;
      percentage: number;
    };
    leadsConverted: {
      current: number;
      target: number;
      percentage: number;
    };
    visitsCompleted: {
      current: number;
      target: number;
      percentage: number;
    };
  };
  todayEvents: Array<{
    id: string;
    title: string;
    start_time: string;
    end_time?: string;
    event_type: string;
    description?: string;
  }>;
}

export const useMobileMetrics = () => {
  const [metrics, setMetrics] = useState<MobileMetrics>({
    salesData: {
      currentMonth: 0,
      previousMonth: 0,
      percentage: 0,
      target: 0
    },
    leadsData: {
      total: 0,
      new: 0,
      hot: 0,
      thisWeek: 0
    },
    performance: {
      salesGoal: {
        current: 0,
        target: 0,
        percentage: 0
      },
      leadsConverted: {
        current: 0,
        target: 20,
        percentage: 0
      },
      visitsCompleted: {
        current: 0,
        target: 15,
        percentage: 0
      }
    },
    todayEvents: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMobileMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/mobile/metrics');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch mobile metrics: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch mobile metrics');
        }
        
        setMetrics(result.data);

      } catch (err) {
        console.error('Erro ao buscar métricas mobile:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchMobileMetrics();
  }, []);

  const refreshMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mobile/metrics');
      
      if (!response.ok) {
        throw new Error(`Failed to refresh mobile metrics: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh mobile metrics');
      }
      
      setMetrics(result.data);
    } catch (err) {
      console.error('Erro ao recarregar métricas mobile:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getConversionRate = () => {
    const { leadsConverted } = metrics.performance;
    const { total } = metrics.leadsData;
    return total > 0 ? Math.round((leadsConverted.current / total) * 100) : 0;
  };

  const getTodayEvents = () => {
    return metrics.todayEvents?.map(event => ({
      id: event.id,
      title: event.title,
      time: new Date(event.start_time).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: event.event_type === 'property_visit' ? 'visit' : 'meeting'
    })) || [];
  };

  return {
    metrics,
    loading,
    error,
    refreshMetrics,
    getConversionRate,
    getTodayEvents
  };
};