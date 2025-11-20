'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  User,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  MessageSquare,
  Clock,
  MapPin,
  Building,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OptimizedLeadCardProps {
  lead: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    budget_max?: number | null;
    budget_min?: number | null;
    source?: string | null;
    temperature?: 'hot' | 'warm' | 'cold' | null;
    score?: number | null;
    property_types?: string[] | null;
    city?: string | null;
    neighborhood?: string | null;
    last_contact_at?: string | null;
    total_interactions?: number | null;
    stage_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  isDragging?: boolean;
  onClick?: (lead: any) => void;
  showCompactView?: boolean;
}

// Time calculations memoized
const useTimeMetrics = (lead: OptimizedLeadCardProps['lead']) => {
  return useMemo(() => {
    const now = new Date();
    const createdAt = new Date(lead.created_at || now);
    const lastContact = lead.last_contact_at ? new Date(lead.last_contact_at) : null;
    
    // Days in current stage (approximation based on updated_at)
    const updatedAt = new Date(lead.updated_at || lead.created_at || now);
    const daysInStage = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Days since last contact
    const daysSinceContact = lastContact 
      ? Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Lead age
    const leadAge = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      daysInStage,
      daysSinceContact,
      leadAge,
      isStale: daysSinceContact !== null && daysSinceContact > 7, // More than 7 days without contact
      isNewLead: leadAge <= 3, // Lead created in last 3 days
    };
  }, [lead.created_at, lead.updated_at, lead.last_contact_at]);
};

// Value formatting memoized
const useFormattedValue = (budgetMax?: number | null, budgetMin?: number | null) => {
  return useMemo(() => {
    const value = budgetMax || budgetMin || 0;
    if (value === 0) return 'N/A';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: value >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 0,
    }).format(value);
  }, [budgetMax, budgetMin]);
};

// Temperature styling memoized
const useTemperatureStyle = (temperature?: string | null, isStale?: boolean) => {
  return useMemo(() => {
    if (isStale) {
      return {
        emoji: '❄️',
        className: 'text-gray-400 bg-gray-50',
        borderColor: 'border-l-gray-300',
        label: 'Frio (sem contato)',
      };
    }
    
    switch (temperature) {
      case 'hot':
        return {
          emoji: '🔥',
          className: 'text-red-600 bg-red-50',
          borderColor: 'border-l-red-400',
          label: 'Quente',
        };
      case 'warm':
        return {
          emoji: '☀️',
          className: 'text-orange-600 bg-orange-50',
          borderColor: 'border-l-orange-400',
          label: 'Morno',
        };
      case 'cold':
        return {
          emoji: '❄️',
          className: 'text-blue-600 bg-blue-50',
          borderColor: 'border-l-blue-400',
          label: 'Frio',
        };
      default:
        return {
          emoji: '😐',
          className: 'text-gray-600 bg-gray-50',
          borderColor: 'border-l-gray-300',
          label: 'Neutro',
        };
    }
  }, [temperature, isStale]);
};

// Property types mapping
const propertyTypeLabels: Record<string, string> = {
  'apartment': 'Apartamento',
  'house': 'Casa',
  'land': 'Terreno',
  'commercial': 'Comercial',
  'studio': 'Kitnet',
  'loft': 'Loft',
  'townhouse': 'Sobrado',
  'penthouse': 'Cobertura',
};

const OptimizedLeadCardComponent: React.FC<OptimizedLeadCardProps> = ({
  lead,
  isDragging = false,
  onClick,
  showCompactView = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: lead.id });
  
  // Memoized calculations
  const timeMetrics = useTimeMetrics(lead);
  const formattedValue = useFormattedValue(lead.budget_max, lead.budget_min);
  const tempStyle = useTemperatureStyle(lead.temperature, timeMetrics.isStale);
  
  // Memoized initials
  const initials = useMemo(() => {
    if (!lead.name) return 'NA';
    return lead.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [lead.name]);
  
  // Memoized property types display
  const propertyTypesDisplay = useMemo(() => {
    if (!lead.property_types || lead.property_types.length === 0) return null;
    
    const displayTypes = lead.property_types.slice(0, 2).map(type => 
      propertyTypeLabels[type] || type
    );
    
    return {
      displayTypes,
      hasMore: lead.property_types.length > 2,
      remainingCount: lead.property_types.length - 2,
    };
  }, [lead.property_types]);
  
  // Memoized contact info
  const contactInfo = useMemo(() => {
    return {
      hasPhone: !!lead.phone,
      hasEmail: !!lead.email,
      formattedPhone: lead.phone ? lead.phone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : null,
    };
  }, [lead.phone, lead.email]);
  
  // Click handler
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(lead);
  }, [onClick, lead]);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  if (showCompactView) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "bg-background border rounded-lg p-3 cursor-grab active:cursor-grabbing",
          "hover:shadow-md transition-all duration-200",
          "border-l-4",
          tempStyle.borderColor,
          tempStyle.className
        )}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{lead.name || 'Sem nome'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {formattedValue}
                {timeMetrics.isStale && (
                  <AlertTriangle className="inline h-3 w-3 ml-1 text-amber-500" />
                )}
              </p>
            </div>
          </div>
          <span className="text-lg" title={tempStyle.label}>
            {tempStyle.emoji}
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200",
        "border-l-4",
        tempStyle.borderColor,
        timeMetrics.isNewLead && "ring-2 ring-green-200",
        isDragging && "shadow-xl rotate-2"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {lead.name || 'Sem nome'}
                {timeMetrics.isNewLead && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Novo
                  </Badge>
                )}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {lead.source || 'Direto'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-lg" title={tempStyle.label}>
              {tempStyle.emoji}
            </span>
            {lead.score && (
              <Badge variant="outline" className="text-xs">
                {lead.score}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-1 mb-3">
          {contactInfo.hasPhone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{contactInfo.formattedPhone}</span>
            </div>
          )}
          {contactInfo.hasEmail && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
        </div>
        
        {/* Value and Budget */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{formattedValue}</span>
          </div>
          {timeMetrics.isStale && (
            <div className="flex items-center gap-1 text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs">Sem contato</span>
            </div>
          )}
        </div>
        
        {/* Property Types */}
        {propertyTypesDisplay && (
          <div className="flex flex-wrap gap-1 mb-3">
            {propertyTypesDisplay.displayTypes.map((type, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
            {propertyTypesDisplay.hasMore && (
              <Badge variant="secondary" className="text-xs">
                +{propertyTypesDisplay.remainingCount}
              </Badge>
            )}
          </div>
        )}
        
        {/* Location */}
        {(lead.city || lead.neighborhood) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {lead.city}{lead.neighborhood ? `, ${lead.neighborhood}` : ''}
            </span>
          </div>
        )}
        
        {/* Footer - Time metrics and interactions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-3">
            {/* Time in stage */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{timeMetrics.daysInStage}d</span>
            </div>
            
            {/* Last contact */}
            {timeMetrics.daysSinceContact !== null && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {timeMetrics.daysSinceContact === 0 
                    ? 'Hoje' 
                    : `${timeMetrics.daysSinceContact}d atrás`
                  }
                </span>
              </div>
            )}
          </div>
          
          {/* Interactions count */}
          {(lead.total_interactions || 0) > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{lead.total_interactions}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const OptimizedLeadCard = memo(OptimizedLeadCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.lead.id === nextProps.lead.id &&
    prevProps.lead.updated_at === nextProps.lead.updated_at &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.showCompactView === nextProps.showCompactView
  );
});

OptimizedLeadCard.displayName = 'OptimizedLeadCard';