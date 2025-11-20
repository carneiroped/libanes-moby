'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SparklineData } from '@/types/analytics';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: SparklineData;
  width?: number;
  height?: number;
  showTrend?: boolean;
  showTooltip?: boolean;
  className?: string;
  color?: string;
}

export default function SparklineChart({
  data,
  width = 60,
  height = 20,
  showTrend = true,
  showTooltip = true,
  className,
  color,
}: SparklineChartProps) {
  if (!data.data || data.data.length === 0) {
    return (
      <div 
        className={cn('flex items-center justify-center bg-muted/30 rounded', className)}
        style={{ width, height }}
      >
        <Minus className="h-3 w-3 text-muted-foreground" />
      </div>
    );
  }

  // Transform data for recharts
  const chartData = data.data.map((value, index) => ({
    index,
    value,
  }));

  // Determine color based on trend
  const getColor = () => {
    if (color) return color;
    
    switch (data.trend) {
      case 'up':
        return '#10b981'; // green
      case 'down':
        return '#ef4444'; // red
      case 'neutral':
        return '#6b7280'; // gray
      default:
        return '#3b82f6'; // blue
    }
  };

  const getTrendIcon = () => {
    if (!showTrend) return null;
    
    const iconClass = "h-3 w-3";
    switch (data.trend) {
      case 'up':
        return <TrendingUp className={cn(iconClass, 'text-green-600 dark:text-green-400')} />;
      case 'down':
        return <TrendingDown className={cn(iconClass, 'text-red-600 dark:text-red-400')} />;
      case 'neutral':
        return <Minus className={cn(iconClass, 'text-gray-500 dark:text-gray-400')} />;
    }
  };

  const sparklineContent = (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <ResponsiveContainer width={width} height={height}>
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={getColor()}
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {showTrend && (
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={cn(
            'text-xs font-medium',
            data.trend === 'up' && 'text-green-600 dark:text-green-400',
            data.trend === 'down' && 'text-red-600 dark:text-red-400',
            data.trend === 'neutral' && 'text-gray-500 dark:text-gray-400'
          )}>
            {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );

  if (!showTooltip) {
    return sparklineContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {sparklineContent}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium text-sm">Tendência dos Últimos Pontos</p>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span>Valores:</span>
              <span className="font-mono">
                [{data.data.slice(0, 3).join(', ')}{data.data.length > 3 ? '...' : ''}]
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span>Mudança:</span>
              <span className={cn(
                'font-medium',
                data.trend === 'up' && 'text-green-600',
                data.trend === 'down' && 'text-red-600',
                data.trend === 'neutral' && 'text-gray-500'
              )}>
                {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}%
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}