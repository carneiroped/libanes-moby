'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import MobileKanbanColumn from './MobileKanbanColumn';
import MobileKanbanCard from './MobileKanbanCard';
import { Filter, Search } from 'lucide-react';
import { useLeads, useLeadStages, useUpdateLead, getRelativeTime } from '@/hooks/useLeads';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  property: string;
  value: string;
  source: string;
  priority: 'baixa' | 'media' | 'alta';
  lastContact: string;
  notes?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  leads: Lead[];
}

const MobileKanban: React.FC = () => {
  const { data: leadsData, isLoading } = useLeads();
  const { data: stagesData } = useLeadStages(); // Usar hook correto para estágios
  const updateLead = useUpdateLead(); // Hook para atualizar leads
  const [stages, setStages] = useState<Stage[]>([]);

  // Efeito para carregar dados reais quando disponíveis
  useEffect(() => {
    if (stagesData && leadsData?.leads) {
      const realStages = stagesData.map((stage: any) => {
        // Filtrar leads por estágio
        const stageLeads = leadsData.leads
          .filter((lead: any) => lead.stage_id === stage.id)
          .map((lead: any) => {
            // Mapear lead para o formato esperado pelo componente
            const propertyType = Array.isArray(lead.property_types) && lead.property_types.length > 0 
              ? lead.property_types[0] 
              : 'Tipo não definido';
            
            const desiredLocation = lead.desired_locations 
              ? (typeof lead.desired_locations === 'object' 
                  ? (Array.isArray(lead.desired_locations?.areas) && lead.desired_locations.areas.length > 0
                      ? lead.desired_locations.areas[0]
                      : lead.desired_locations?.city || 'Local não definido')
                  : 'Local não definido')
              : 'Local não definido';

            const formatBudget = (min: number, max: number) => {
              if (min && max) {
                return `R$ ${(min / 1000).toFixed(0)}k - ${(max / 1000).toFixed(0)}k`;
              } else if (min) {
                return `A partir de R$ ${(min / 1000).toFixed(0)}k`;
              } else if (max) {
                return `Até R$ ${(max / 1000).toFixed(0)}k`;
              }
              return 'Orçamento não definido';
            };

            const priority = lead.temperature === 'hot' || lead.temperature === 'very_hot' 
              ? 'alta' 
              : lead.temperature === 'warm' 
                ? 'media' 
                : 'baixa';

            return {
              id: lead.id,
              name: lead.name || 'Lead sem nome',
              phone: lead.phone || '',
              email: lead.email || '',
              property: `${propertyType} - ${desiredLocation}`,
              value: formatBudget(lead.budget_min, lead.budget_max),
              source: lead.source || 'Não informado',
              priority: priority as 'baixa' | 'media' | 'alta',
              lastContact: lead.last_contact_at ? getRelativeTime(lead.last_contact_at) : 'Nunca'
            };
          });

        return {
          id: stage.id,
          name: stage.name,
          color: stage.color || '#6b7280',
          leads: stageLeads
        };
      });

      setStages(realStages);
    }
  }, [stagesData, leadsData]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStage = stages.find(stage => stage.id === source.droppableId);
    const destStage = stages.find(stage => stage.id === destination.droppableId);

    if (!sourceStage || !destStage) {
      return;
    }

    const lead = sourceStage.leads.find(lead => lead.id === draggableId);
    if (!lead) {
      return;
    }

    // Atualizar UI otimisticamente
    const newStages = stages.map(stage => {
      if (stage.id === source.droppableId) {
        return {
          ...stage,
          leads: stage.leads.filter(l => l.id !== draggableId)
        };
      }
      if (stage.id === destination.droppableId) {
        const newLeads = [...stage.leads];
        newLeads.splice(destination.index, 0, lead);
        return {
          ...stage,
          leads: newLeads
        };
      }
      return stage;
    });

    setStages(newStages);

    // Atualizar no banco de dados
    try {
      await updateLead.mutateAsync({
        id: draggableId,
        stage_id: destination.droppableId
      });
    } catch (error) {
      console.error('Erro ao mover lead:', error);
      // Reverter mudança em caso de erro
      setStages(stages);
    }
  };

  const getTotalLeads = () => {
    return stages.reduce((total, stage) => total + stage.leads.length, 0);
  };

  const getHotLeads = () => {
    return stages.reduce((total, stage) => 
      total + stage.leads.filter(lead => lead.priority === 'alta').length, 0
    );
  };

  // Loading state
  if (isLoading || !stagesData) {
    return (
      <div className="space-y-4 pb-6">
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="flex space-x-3 overflow-x-auto">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="min-w-[280px] h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Search and Filters */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-muted-foreground" />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary"
            placeholder="Buscar leads..."
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="bg-secondary p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Mostrar filtros"
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border p-3 rounded-lg text-center">
          <p className="text-lg font-semibold text-foreground">{getTotalLeads()}</p>
          <p className="text-xs text-muted-foreground">Total Leads</p>
        </div>
        <div className="bg-card border border-border p-3 rounded-lg text-center">
          <p className="text-lg font-semibold text-foreground">{getHotLeads()}</p>
          <p className="text-xs text-muted-foreground">Quentes</p>
        </div>
        <div className="bg-card border border-border p-3 rounded-lg text-center">
          <p className="text-lg font-semibold text-foreground">
            {Math.round((getHotLeads() / getTotalLeads()) * 100) || 0}%
          </p>
          <p className="text-xs text-muted-foreground">Conversão</p>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <div className="flex space-x-3 pb-4 w-max">
            {stages.map((stage) => (
              <MobileKanbanColumn
                key={stage.id}
                stage={stage}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      {/* Legend */}
      <div className="bg-card border border-border rounded-lg p-3">
        <h3 className="text-foreground text-sm font-medium mb-2">Prioridades</h3>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
            <span className="text-muted-foreground">Alta</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
            <span className="text-muted-foreground">Média</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span className="text-muted-foreground">Baixa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileKanban;