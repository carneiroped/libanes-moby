'use client';

import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import MobileKanbanCard from './MobileKanbanCard';

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

interface MobileKanbanColumnProps {
  stage: Stage;
  searchTerm: string;
}

const MobileKanbanColumn: React.FC<MobileKanbanColumnProps> = ({ stage, searchTerm }) => {
  const filteredLeads = stage.leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  return (
    <div className="min-w-[280px] bg-gray-800 rounded-lg">
      {/* Column Header */}
      <div 
        className="p-3 rounded-t-lg border-b border-gray-700"
        style={{ backgroundColor: `${stage.color}20` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            ></div>
            <h3 className="text-white font-medium text-sm">{stage.name}</h3>
          </div>
          <div className="flex items-center space-x-1">
            <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
              {filteredLeads.length}
            </span>
          </div>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-gray-700/50' : ''
            }`}
          >
            <div className="space-y-2">
              {filteredLeads.map((lead, index) => (
                <MobileKanbanCard
                  key={lead.id}
                  lead={lead}
                  index={index}
                />
              ))}
            </div>
            {provided.placeholder}
            
            {/* Empty State */}
            {filteredLeads.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'Nenhum lead encontrado' : 'Nenhum lead neste estágio'}
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default MobileKanbanColumn;