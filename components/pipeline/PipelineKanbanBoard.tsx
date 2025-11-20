'use client';

import React, { memo, useMemo, useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  rectIntersection,
  DragMoveEvent,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  horizontalListSortingStrategy 
} from '@dnd-kit/sortable';
import {
  Settings,
  Filter,
  Eye,
  EyeOff,
  BarChart3,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  Users,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { VirtualizedStageColumn } from './VirtualizedStageColumn';
import { OptimizedLeadCard } from './OptimizedLeadCard';
import { cn } from '@/lib/utils';

interface PipelineKanbanBoardProps {
  pipeline: {
    id: string;
    name: string;
    stages: Array<{
      id: string;
      name: string;
      color: string;
      probability?: number;
      order: number;
    }>;
  };
  leads: any[];
  onLeadMove: (leadId: string, targetStageId: string) => Promise<void>;
  onLeadClick: (lead: any) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

// Pipeline metrics calculation
const usePipelineMetrics = (pipeline: PipelineKanbanBoardProps['pipeline'], leads: any[]) => {
  return useMemo(() => {
    const totalLeads = leads.length;

    // Group leads by stage
    const leadsByStage = leads.reduce((acc, lead) => {
      const stageId = lead.stage; // Usar lead.stage diretamente (ENUM)
      if (!acc[stageId]) acc[stageId] = [];
      acc[stageId].push(lead);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate conversion funnel - distribuição percentual
    const stageMetrics = pipeline.stages.map((stage, index) => {
      const stageLeads = leadsByStage[stage.id] || [];

      // Calcular porcentagem de distribuição (% em relação ao total)
      const percentage = totalLeads > 0 ? (stageLeads.length / totalLeads) * 100 : 0;

      return {
        stageId: stage.id,
        stageName: stage.name,
        leadsCount: stageLeads.length,
        percentage, // Distribuição percentual
        color: stage.color,
      };
    });

    // Calculate velocity (simplified - recent activity)
    const now = new Date();
    const recentActivity = leads.filter(lead => {
      const updatedAt = new Date(lead.updated_at || lead.created_at || now);
      return (now.getTime() - updatedAt.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
    }).length;

    return {
      totalLeads,
      stageMetrics,
      velocity: recentActivity / 7, // Leads per day
      leadsByStage,
    };
  }, [pipeline.stages, leads]);
};

// Conversion funnel component
const ConversionFunnel = memo<{
  stageMetrics: any[];
  className?: string;
}>(({ stageMetrics, className }) => {
  return (
    <Card className={cn("mb-4", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Distribuição de Leads por Estágio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stageMetrics.map((stage, index) => (
            <div key={stage.stageId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-medium">{stage.stageName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{stage.leadsCount}</span>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {stage.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Progress
                value={stage.percentage}
                className="h-2"
                style={{
                  '--progress-background': `${stage.color}30`,
                  '--progress-foreground': stage.color
                } as any}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

ConversionFunnel.displayName = 'ConversionFunnel';

// Main component
const PipelineKanbanBoardComponent: React.FC<PipelineKanbanBoardProps> = ({
  pipeline,
  leads,
  onLeadMove,
  onLeadClick,
  onRefresh,
  isLoading = false,
  className,
}) => {
  // State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStageId, setOverStageId] = useState<string | null>(null);
  const [isCompactView, setIsCompactView] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showFunnel, setShowFunnel] = useState(true);
  
  // Calculate metrics
  const metrics = usePipelineMetrics(pipeline, leads);
  
  // Setup sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Find active lead
  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;
  
  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  }, []);
  
  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverStageId(null);
      return;
    }

    // CORREÇÃO: Detectar stage mesmo quando over está sobre um lead
    let stageId = '';

    if (over.id.toString().startsWith('stage-')) {
      // Over the stage column
      stageId = over.id.toString().replace('stage-', '');
    } else if (over.data?.current?.stageId) {
      // Over element with stageId in data
      stageId = over.data.current.stageId;
    } else {
      // Over a lead - get its stage
      const overLead = leads.find(l => l.id === over.id.toString());
      if (overLead) {
        stageId = overLead.stage;
      }
    }

    setOverStageId(stageId || null);
  }, [leads]);
  
  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverStageId(null);

    if (!over) return;

    const leadId = active.id.toString();
    let targetStageId = '';

    // CORREÇÃO: Aceitar drops sobre stage column OU sobre leads dentro da coluna
    if (over.id.toString().startsWith('stage-')) {
      // Dropped on the stage column itself
      targetStageId = over.id.toString().replace('stage-', '');
    } else if (over.data?.current?.stageId) {
      // Dropped on element with stageId in data
      targetStageId = over.data.current.stageId;
    } else {
      // Check if dropped on another lead - get its stage
      const overLead = leads.find(l => l.id === over.id.toString());
      if (overLead) {
        targetStageId = overLead.stage; // Usar lead.stage (ENUM)
      } else {
        // Try to find stage from DOM
        const element = document.getElementById(over.id.toString());
        const stageIdFromDOM = element?.getAttribute('data-stage-id');
        if (stageIdFromDOM) {
          targetStageId = stageIdFromDOM;
        } else {
          // Não foi possível determinar o stage, cancelar
          console.warn('Não foi possível determinar o estágio de destino');
          return;
        }
      }
    }

    // Validate targetStageId
    if (!targetStageId) {
      console.warn('ID do estágio de destino inválido');
      return;
    }

    // Find the lead
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.stage === targetStageId) return; // Usar lead.stage

    try {
      await onLeadMove(leadId, targetStageId);

      // Show success feedback
      const targetStage = pipeline.stages.find(s => s.id === targetStageId);
      toast({
        title: 'Lead movido com sucesso',
        description: `${lead.name || 'Lead'} foi movido para "${targetStage?.name}"`,
      });
    } catch (error) {
      console.error('Error moving lead:', error);
      toast({
        title: 'Erro ao mover lead',
        description: 'Não foi possível mover o lead. Tente novamente.',
        variant: 'destructive',
      });
    }
  }, [leads, pipeline.stages, onLeadMove]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'r':
            event.preventDefault();
            onRefresh?.();
            break;
          case 'm':
            event.preventDefault();
            setShowMetrics(!showMetrics);
            break;
          case 'f':
            event.preventDefault();
            setShowFunnel(!showFunnel);
            break;
          case 'c':
            event.preventDefault();
            setIsCompactView(!isCompactView);
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showMetrics, showFunnel, isCompactView, onRefresh]);
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Pipeline Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{pipeline.name}</h2>
          <Badge variant="outline" className="font-mono">
            {metrics.totalLeads} leads
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCompactView(!isCompactView)}
            title={`${isCompactView ? 'Expandir' : 'Compactar'} visualização (Ctrl+C)`}
          >
            {isCompactView ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFunnel(!showFunnel)}
            title={`${showFunnel ? 'Ocultar' : 'Mostrar'} funil (Ctrl+F)`}
          >
            {showFunnel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          
          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Opções
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Visualização</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showMetrics}
                onCheckedChange={setShowMetrics}
              >
                Mostrar métricas dos estágios
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showFunnel}
                onCheckedChange={setShowFunnel}
              >
                Mostrar funil de conversão
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={isCompactView}
                onCheckedChange={setIsCompactView}
              >
                Visualização compacta
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={onRefresh} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Atualizar dados
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Exportar pipeline
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Conversion Funnel */}
      {showFunnel && (
        <ConversionFunnel
          stageMetrics={metrics.stageMetrics}
        />
      )}
      
      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pipeline.stages.map(s => s.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {pipeline.stages.map((stage) => (
              <VirtualizedStageColumn
                key={stage.id}
                stage={stage}
                leads={metrics.leadsByStage[stage.id] || []}
                onLeadClick={onLeadClick}
                isCompact={isCompactView}
                showMetrics={showMetrics}
                className={overStageId === stage.id ? "ring-2 ring-blue-400 bg-blue-50/20" : ""}
              />
            ))}
          </div>
        </SortableContext>
        
        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && activeLead ? (
            <div className="rotate-3 shadow-xl opacity-90">
              <OptimizedLeadCard
                lead={activeLead}
                isDragging={true}
                showCompactView={isCompactView}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Atualizando pipeline...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const PipelineKanbanBoard = memo(PipelineKanbanBoardComponent);
PipelineKanbanBoard.displayName = 'PipelineKanbanBoard';