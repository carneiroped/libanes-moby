'use client';

import { Target, TrendingUp, TrendingDown, AlertCircle, Trophy, Building, History } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BenchmarkData } from '@/types/analytics';
import { cn } from '@/lib/utils';

interface BenchmarkIndicatorProps {
  current: number;
  benchmark: BenchmarkData;
  unit?: 'number' | 'percentage' | 'currency' | 'duration';
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  showProgress?: boolean;
  className?: string;
}

export default function BenchmarkIndicator({
  current,
  benchmark,
  unit = 'number',
  size = 'md',
  layout = 'horizontal',
  showProgress = true,
  className,
}: BenchmarkIndicatorProps) {
  // Calculate the difference and percentage
  const difference = current - benchmark.value;
  const differencePercent = benchmark.value === 0 ? 0 : (difference / benchmark.value) * 100;
  const progressValue = benchmark.value === 0 ? 100 : Math.min(100, (current / benchmark.value) * 100);

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'h-3 w-3',
      text: 'text-xs',
      badge: 'text-xs px-1.5 py-0.5',
      value: 'text-sm',
      spacing: 'gap-1',
    },
    md: {
      icon: 'h-4 w-4',
      text: 'text-sm',
      badge: 'text-sm px-2 py-1',
      value: 'text-base',
      spacing: 'gap-2',
    },
    lg: {
      icon: 'h-5 w-5',
      text: 'text-base',
      badge: 'text-base px-2.5 py-1.5',
      value: 'text-lg',
      spacing: 'gap-3',
    },
  };

  const config = sizeConfig[size];

  // Format values based on unit type
  const formatValue = (value: number): string => {
    switch (unit) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
      case 'duration':
        if (value < 1) return `${(value * 60).toFixed(0)}min`;
        if (value < 24) return `${value.toFixed(1)}h`;
        return `${(value / 24).toFixed(1)}d`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  // Get icon based on benchmark type
  const getBenchmarkIcon = () => {
    switch (benchmark.type) {
      case 'goal':
        return <Target className={config.icon} />;
      case 'industry':
        return <Building className={config.icon} />;
      case 'previous_best':
        return <History className={config.icon} />;
      default:
        return <Target className={config.icon} />;
    }
  };

  // Get status color and icon
  const getStatusConfig = () => {
    switch (benchmark.status) {
      case 'above':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
          icon: <TrendingUp className={config.icon} />,
          progressColor: 'bg-green-500',
        };
      case 'below':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
          icon: <TrendingDown className={config.icon} />,
          progressColor: 'bg-red-500',
        };
      case 'at':
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
          icon: <Trophy className={config.icon} />,
          progressColor: 'bg-blue-500',
        };
    }
  };

  const statusConfig = getStatusConfig();

  const content = (
    <div className={cn(
      'flex items-center',
      layout === 'vertical' ? 'flex-col' : 'flex-row',
      config.spacing,
      className
    )}>
      {/* Current Value */}
      <div className="flex items-center gap-1">
        <span className={cn('font-semibold', config.value)}>
          {formatValue(current)}
        </span>
      </div>

      {/* Status Badge */}
      <Badge
        variant="outline"
        className={cn(
          'flex items-center gap-1',
          statusConfig.bgColor,
          statusConfig.color,
          config.badge
        )}
      >
        {statusConfig.icon}
        <span>{Math.abs(differencePercent).toFixed(1)}%</span>
      </Badge>

      {/* Benchmark Info */}
      <div className="flex items-center gap-1 text-muted-foreground">
        {getBenchmarkIcon()}
        <span className={config.text}>
          {benchmark.label}
        </span>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className={cn(
          'flex-1 min-w-[60px]',
          layout === 'vertical' && 'w-full'
        )}>
          <Progress 
            value={Math.min(100, Math.max(0, progressValue))} 
            className="h-2"
            // Add custom progress color styling
            style={{ 
              // @ts-ignore - Custom CSS property
              '--progress-foreground': statusConfig.progressColor 
            } as any}
          />
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <p className="font-medium">Comparação com Benchmark</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span>Valor Atual:</span>
                <span className="font-medium">{formatValue(current)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>{benchmark.label}:</span>
                <span className="font-medium">{formatValue(benchmark.value)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Diferença:</span>
                <span className={cn(
                  'font-medium',
                  difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-500'
                )}>
                  {difference > 0 ? '+' : ''}{formatValue(Math.abs(difference))}
                  ({differencePercent > 0 ? '+' : ''}{differencePercent.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Status:</span>
                <span className={statusConfig.color}>
                  {benchmark.status === 'above' && 'Acima do benchmark'}
                  {benchmark.status === 'below' && 'Abaixo do benchmark'}
                  {benchmark.status === 'at' && 'No benchmark'}
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}