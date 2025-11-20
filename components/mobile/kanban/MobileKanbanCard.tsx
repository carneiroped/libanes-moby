'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Phone, MessageSquare, MapPin, Clock, Star } from 'lucide-react';

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

interface MobileKanbanCardProps {
  lead: Lead;
  index: number;
}

const MobileKanbanCard: React.FC<MobileKanbanCardProps> = ({ lead, index }) => {
  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'alta': return 'border-l-red-500 bg-red-900/10';
      case 'media': return 'border-l-amber-500 bg-amber-900/10';
      case 'baixa': return 'border-l-green-500 bg-green-900/10';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'site': return 'bg-blue-900/30 text-blue-400';
      case 'whatsapp': return 'bg-green-900/30 text-green-400';
      case 'instagram': return 'bg-purple-900/30 text-purple-400';
      case 'indicação': return 'bg-amber-900/30 text-amber-400';
      case 'portal': return 'bg-gray-600/30 text-gray-400';
      default: return 'bg-gray-600/30 text-gray-400';
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${lead.phone}`);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Olá ${lead.name}, tudo bem? Sobre o ${lead.property}...`;
    const phoneNumber = lead.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`);
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-gray-700 rounded-lg p-3 border-l-4 cursor-move transition-all ${
            getPriorityColor(lead.priority)
          } ${
            snapshot.isDragging 
              ? 'transform rotate-3 scale-105 shadow-lg bg-gray-600' 
              : 'hover:bg-gray-650'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-1">
              <h4 className="text-white font-medium text-sm truncate">{lead.name}</h4>
              {lead.priority === 'alta' && (
                <Star size={12} className="text-amber-400 flex-shrink-0" />
              )}
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded ${getSourceColor(lead.source)}`}>
              {lead.source}
            </span>
          </div>

          {/* Property */}
          <div className="flex items-center text-xs text-gray-300 mb-2">
            <MapPin size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">{lead.property}</span>
          </div>

          {/* Value */}
          <div className="text-emerald-400 font-semibold text-sm mb-2">
            {lead.value}
          </div>

          {/* Last Contact */}
          <div className="flex items-center text-xs text-gray-400 mb-3">
            <Clock size={12} className="mr-1" />
            <span>Último contato: {lead.lastContact}</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-1">
            <button 
              onClick={handleCall}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-xs py-1.5 rounded flex items-center justify-center transition-colors"
            >
              <Phone size={12} className="mr-1" />
              Ligar
            </button>
            <button 
              onClick={handleWhatsApp}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1.5 rounded flex items-center justify-center transition-colors"
            >
              <MessageSquare size={12} className="mr-1" />
              WhatsApp
            </button>
          </div>

          {/* Notes indicator */}
          {lead.notes && (
            <div className="mt-2 text-xs text-gray-400 italic truncate">
              &quot;{lead.notes}&quot;
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default MobileKanbanCard;