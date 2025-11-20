'use client';

import React, { memo, useMemo, useCallback, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { OptimizedLeadCard } from './OptimizedLeadCard';
import { cn } from '@/lib/utils';

interface StageMetrics {
  totalLeads: number;
  avgTimeInStage: number;
  conversionRate?: number;
  velocity: number; // Leads moved per day
  bottleneckRisk: 'low' | 'medium' | 'high';
}

interface VirtualizedStageColumnProps {
  stage: {
    id: string;
    name: string;
    color: string;
    probability?: number;
    order: number;
  };
  leads: any[];
  onLeadClick: (lead: any) => void;
  isCompact?: boolean;
  showMetrics?: boolean;
  className?: string;
}

// Calculate stage metrics
const useStageMetrics = (leads: any[]): StageMetrics => {
  return useMemo(() => {
    const totalLeads = leads.length;

    // Calculate average time in stage (approximation based on updated_at)
    const now = new Date();
    const timeInStageData = leads.map(lead => {
      const updatedAt = new Date(lead.updated_at || lead.created_at || now);
      return Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    });

    const avgTimeInStage = timeInStageData.length > 0
      ? timeInStageData.reduce((sum, days) => sum + days, 0) / timeInStageData.length
      : 0;

    // Calculate velocity (simplified - leads with recent activity)
    const recentActivity = leads.filter(lead => {
      const updatedAt = new Date(lead.updated_at || lead.created_at || now);
      const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 7; // Activity in last 7 days
    }).length;

    const velocity = recentActivity / 7; // Leads per day

    // Determine bottleneck risk
    let bottleneckRisk: 'low' | 'medium' | 'high' = 'low';
    if (avgTimeInStage > 14) bottleneckRisk = 'high';
    else if (avgTimeInStage > 7) bottleneckRisk = 'medium';

    return {
      totalLeads,
      avgTimeInStage,
      velocity,
      bottleneckRisk,
    };
  }, [leads]);
};

// Stage header component
const StageHeader = memo<{
  stage: VirtualizedStageColumnProps['stage'];
  metrics: StageMetrics;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onFilterChange: (value: string) => void;
  filterValue: string;
  showMetrics: boolean;
}>(({ stage, metrics, isCollapsed, onToggleCollapse, onFilterChange, filterValue, showMetrics }) => {
  const getBottleneckColor = useCallback((risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  }, []);
  
  return (
    <CardHeader 
      className="p-4 border-b bg-background rounded-t-lg"
      style={{ borderTopColor: stage.color, borderTopWidth: '3px' }}
    >
      <div className="space-y-3">
        {/* Stage Name and Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: stage.color } as React.CSSProperties}
              suppressHydrationWarning
            />
            <h3 className="font-semibold text-base truncate">{stage.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 w-6 p-0"
            >
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
          <Badge variant="outline" className="font-mono shrink-0">
            {metrics.totalLeads}
          </Badge>
        </div>
        
        {/* Quick Metrics Row */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Tempo médio: {Math.round(metrics.avgTimeInStage)}d</span>
        </div>

        {/* Probability and Bottleneck Indicator */}
        <div className="flex items-center justify-between">
          {stage.probability && (
            <Badge variant="secondary" className="text-xs">
              {stage.probability}% conversão
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className={cn("text-xs", getBottleneckColor(metrics.bottleneckRisk))}
          >
            {metrics.bottleneckRisk === 'high' ? 'Gargalo!' : 
             metrics.bottleneckRisk === 'medium' ? 'Atenção' : 'OK'}
          </Badge>
        </div>
        
        {/* Expanded Metrics */}
        {showMetrics && !isCollapsed && (
          <div className="space-y-2 pt-2 border-t">
            <div className="grid grid-cols-1 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Velocidade</p>
                <p className="font-medium">{metrics.velocity.toFixed(1)} leads/dia</p>
              </div>
            </div>

            {/* Progress indicators */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fluxo</span>
                <span>{metrics.velocity > 0.5 ? 'Bom' : 'Lento'}</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    metrics.velocity > 1 ? "bg-green-500" :
                    metrics.velocity > 0.5 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(100, (metrics.velocity / 2) * 100)}%` } as React.CSSProperties}
                  suppressHydrationWarning
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Search Filter */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Buscar neste estágio..."
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
        )}
      </div>
    </CardHeader>
  );
});

StageHeader.displayName = 'StageHeader';

// Virtual list item renderer
const LeadItemRenderer = memo<{
  index: number;
  style: React.CSSProperties;
  data: {
    leads: any[];
    onLeadClick: (lead: any) => void;
    isCompact: boolean;
  };
}>(({ index, style, data }) => {
  const { leads, onLeadClick, isCompact } = data;
  const lead = leads[index];
  
  if (!lead) return null;
  
  return (
    <div style={{...style, padding: '4px 0'} as React.CSSProperties} suppressHydrationWarning>
      <OptimizedLeadCard
        key={lead.id}
        lead={lead}
        onClick={onLeadClick}
        showCompactView={isCompact}
      />
    </div>
  );
});

LeadItemRenderer.displayName = 'LeadItemRenderer';

// Main component
const VirtualizedStageColumnComponent: React.FC<VirtualizedStageColumnProps> = ({
  stage,
  leads,
  onLeadClick,
  isCompact = false,
  showMetrics = true,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  // Setup droppable - CORREÇÃO: Aplicar ao Card inteiro, não apenas ao CardContent
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
    data: {
      type: 'stage-column',
      stageId: stage.id
    }
  });

  // Calculate metrics
  const metrics = useStageMetrics(leads);

  // Filter leads based on search
  const filteredLeads = useMemo(() => {
    if (!filterValue.trim()) return leads;

    const searchTerm = filterValue.toLowerCase();
    return leads.filter(lead =>
      lead.name?.toLowerCase().includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm) ||
      lead.phone?.includes(searchTerm) ||
      lead.source?.toLowerCase().includes(searchTerm)
    );
  }, [leads, filterValue]);

  // Item data for virtual list
  const itemData = useMemo(() => ({
    leads: filteredLeads,
    onLeadClick,
    isCompact,
  }), [filteredLeads, onLeadClick, isCompact]);

  // Item height calculation
  const itemHeight = isCompact ? 70 : 180;
  const listHeight = Math.min(600, Math.max(200, filteredLeads.length * itemHeight));

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  const handleFilterChange = useCallback((value: string) => {
    setFilterValue(value);
  }, []);

  return (
    <Card
      ref={setNodeRef}
      data-stage-id={stage.id}
      className={cn(
        "flex-shrink-0 w-80 flex flex-col transition-all duration-200 min-h-[500px]",
        isOver && "ring-2 ring-blue-400 bg-blue-50/20",
        className
      )}
    >
      <StageHeader
        stage={stage}
        metrics={metrics}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onFilterChange={handleFilterChange}
        filterValue={filterValue}
        showMetrics={showMetrics}
      />

      {/* Virtual List */}
      {!isCollapsed && (
        <CardContent
          className="p-0 flex-1 min-h-[400px] flex flex-col"
        >
          <SortableContext
            items={filteredLeads.map(lead => lead.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex-1 min-h-0">
              {filteredLeads.length > 0 ? (
                <List
                  height={listHeight}
                  itemCount={filteredLeads.length}
                  itemSize={itemHeight}
                  itemData={itemData}
                  className="p-4"
                  overscanCount={5}
                  width="100%"
                >
                  {LeadItemRenderer}
                </List>
              ) : (
                <div
                  className={cn(
                    "text-center py-12 text-muted-foreground min-h-[400px] flex flex-col items-center justify-center transition-colors",
                    isOver && "bg-primary/5 border-2 border-primary border-dashed rounded-md m-4"
                  )}
                  suppressHydrationWarning
                >
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">
                    {filterValue ? 'Nenhum lead encontrado' : isOver ? '📥 Solte aqui para mover' : 'Nenhum lead neste estágio'}
                  </p>
                  {filterValue && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setFilterValue('')}
                      className="text-xs"
                    >
                      Limpar filtro
                    </Button>
                  )}
                  {!filterValue && !isOver && (
                    <p className="text-xs mt-2 opacity-70">
                      Arraste leads para cá
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* CORREÇÃO: Área de drop sempre disponível no final da lista */}
            {filteredLeads.length > 0 && (
              <div
                className={cn(
                  "min-h-[100px] transition-all duration-200 border-t",
                  isOver && "bg-primary/5 border-primary border-dashed"
                )}
              >
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground p-4">
                  {isOver ? (
                    <span className="text-primary font-medium">📥 Solte aqui para adicionar ao final</span>
                  ) : (
                    <span className="opacity-50">Área de drop disponível</span>
                  )}
                </div>
              </div>
            )}
          </SortableContext>
        </CardContent>
      )}

      {/* Collapsed state indicator */}
      {isCollapsed && (
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <ChevronDown className="h-4 w-4 mx-auto" />
            <p className="text-xs mt-1">Clique para expandir</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export const VirtualizedStageColumn = memo(VirtualizedStageColumnComponent, (prevProps, nextProps) => {
  // Optimize re-renders by comparing leads array length and stage properties
  return (
    prevProps.stage.id === nextProps.stage.id &&
    prevProps.leads.length === nextProps.leads.length &&
    prevProps.stage.name === nextProps.stage.name &&
    prevProps.isCompact === nextProps.isCompact &&
    prevProps.showMetrics === nextProps.showMetrics &&
    // Deep compare leads if lengths are the same but content might have changed
    JSON.stringify(prevProps.leads.map(l => l.updated_at)) === JSON.stringify(nextProps.leads.map(l => l.updated_at))
  );
});

VirtualizedStageColumn.displayName = 'VirtualizedStageColumn';