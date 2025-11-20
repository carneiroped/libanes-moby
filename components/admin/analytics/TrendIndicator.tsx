'use client';

import { TrendingUp, TrendingDown, Minus, Target, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MetricComparison, BenchmarkData } from '@/types/analytics';
import { formatPercentageChange } from '@/lib/analytics/temporal-utils';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  comparison: MetricComparison;
  benchmark?: BenchmarkData;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showBenchmark?: boolean;
  className?: string;
}

export default function TrendIndicator({
  comparison,
  benchmark,
  size = 'md',
  showValue = true,
  showBenchmark = true,
  className,
}: TrendIndicatorProps) {
  const { trend, changePercent, current, previous } = comparison;

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'h-3 w-3',
      text: 'text-xs',
      badge: 'text-xs px-1.5 py-0.5',
      gap: 'gap-1',
    },
    md: {
      icon: 'h-4 w-4',
      text: 'text-sm',
      badge: 'text-sm px-2 py-1',
      gap: 'gap-2',
    },
    lg: {
      icon: 'h-5 w-5',
      text: 'text-base',
      badge: 'text-base px-2.5 py-1.5',
      gap: 'gap-2',
    },
  };

  const config = sizeConfig[size];

  // Determine trend icon and color
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className={cn(config.icon, 'text-green-600 dark:text-green-400')} />;
      case 'down':
        return <TrendingDown className={cn(config.icon, 'text-red-600 dark:text-red-400')} />;
      case 'neutral':
        return <Minus className={cn(config.icon, 'text-gray-500 dark:text-gray-400')} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'down':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
    }
  };

  const getBenchmarkIcon = () => {
    if (!benchmark) return null;
    
    switch (benchmark.status) {
      case 'above':
        return <Target className={cn(config.icon, 'text-green-600 dark:text-green-400')} />;
      case 'below':
        return <AlertCircle className={cn(config.icon, 'text-red-600 dark:text-red-400')} />;
      case 'at':
        return <Target className={cn(config.icon, 'text-blue-600 dark:text-blue-400')} />;
    }
  };

  const getBenchmarkMessage = () => {
    if (!benchmark) return '';
    
    const diff = current - benchmark.value;
    const diffPercent = ((current - benchmark.value) / benchmark.value) * 100;
    
    switch (benchmark.status) {
      case 'above':
        return `${Math.abs(diffPercent).toFixed(1)}% acima da ${benchmark.label}`;
      case 'below':
        return `${Math.abs(diffPercent).toFixed(1)}% abaixo da ${benchmark.label}`;
      case 'at':
        return `Dentro da ${benchmark.label}`;
    }
  };

  return (
    <TooltipProvider>
      <div className={cn('flex items-center', config.gap, className)}>
        {/* Trend Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                'flex items-center gap-1 font-medium',
                getTrendColor(),
                config.badge
              )}
            >
              {getTrendIcon()}
              {formatPercentageChange(changePercent)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">Comparação Temporal</p>
              <p className="text-xs">Atual: {current.toLocaleString('pt-BR')}</p>
              <p className="text-xs">Anterior: {previous.toLocaleString('pt-BR')}</p>
              <p className="text-xs">
                Mudança: {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Current Value */}
        {showValue && (
          <span className={cn('font-semibold', config.text)}>
            {current.toLocaleString('pt-BR')}
          </span>
        )}

        {/* Benchmark Indicator */}
        {showBenchmark && benchmark && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                {getBenchmarkIcon()}
                <span className={cn('text-muted-foreground', config.text)}>
                  {benchmark.label}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">Benchmark</p>
                <p className="text-xs">{benchmark.label}: {benchmark.value.toLocaleString('pt-BR')}</p>
                <p className="text-xs">{getBenchmarkMessage()}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}