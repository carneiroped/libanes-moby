'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useActivityFeed } from './NotificationProvider';
import { ActivityEntry } from '@/lib/feedback/notification-manager';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Filter,
  Trash2,
  Undo2,
  MoreHorizontal,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ActivityFeedProps {
  title?: string;
  showFilter?: boolean;
  showSearch?: boolean;
  showClearAll?: boolean;
  maxItems?: number;
  compact?: boolean;
  showTimestamps?: boolean;
  showUndoActions?: boolean;
  groupByDate?: boolean;
  className?: string;
}

const typeStyles = {
  success: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  info: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
};

export function ActivityFeed({
  title = 'Atividades Recentes',
  showFilter = true,
  showSearch = true,
  showClearAll = true,
  maxItems = 50,
  compact = false,
  showTimestamps = true,
  showUndoActions = true,
  groupByDate = false,
  className,
}: ActivityFeedProps) {
  const { activities, clearActivities } = useActivityFeed();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilters, setTypeFilters] = useState<Set<ActivityEntry['type']>>(new Set());
  const [showOnlyUndoable, setShowOnlyUndoable] = useState(false);

  // Filter and search activities
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query)
      );
    }

    // Apply type filters
    if (typeFilters.size > 0) {
      filtered = filtered.filter(activity => typeFilters.has(activity.type));
    }

    // Apply undoable filter
    if (showOnlyUndoable) {
      filtered = filtered.filter(activity => activity.undoable && activity.onUndo);
    }

    // Limit items
    return filtered.slice(0, maxItems);
  }, [activities, searchQuery, typeFilters, showOnlyUndoable, maxItems]);

  // Group activities by date if requested
  const groupedActivities = useMemo(() => {
    if (!groupByDate) return { '': filteredActivities };

    const groups: Record<string, ActivityEntry[]> = {};
    const now = new Date();

    filteredActivities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      let groupKey = '';

      if (activityDate.toDateString() === now.toDateString()) {
        groupKey = 'Hoje';
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (activityDate.toDateString() === yesterday.toDateString()) {
          groupKey = 'Ontem';
        } else {
          groupKey = activityDate.toLocaleDateString('pt-BR');
        }
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(activity);
    });

    return groups;
  }, [filteredActivities, groupByDate]);

  const handleTypeFilterToggle = (type: ActivityEntry['type']) => {
    setTypeFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(type)) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
      return newFilters;
    });
  };

  const getTypeCount = (type: ActivityEntry['type']) => {
    return activities.filter(activity => activity.type === type).length;
  };

  if (activities.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Nenhuma atividade encontrada
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
            As atividades recentes aparecerão aqui quando você interagir com o sistema.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className={cn('pb-4', compact && 'pb-2')}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn('text-lg', compact && 'text-base')}>
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Filter menu */}
            {showFilter && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {(typeFilters.size > 0 || showOnlyUndoable) && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                        {typeFilters.size + (showOnlyUndoable ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(typeStyles).map(([type, config]) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={typeFilters.has(type as ActivityEntry['type'])}
                      onCheckedChange={() => handleTypeFilterToggle(type as ActivityEntry['type'])}
                    >
                      <config.icon className={cn('h-4 w-4 mr-2', config.color)} />
                      {type === 'success' ? 'Sucesso' : 
                       type === 'error' ? 'Erro' :
                       type === 'warning' ? 'Aviso' : 'Info'}
                      <Badge variant="outline" className="ml-auto text-xs">
                        {getTypeCount(type as ActivityEntry['type'])}
                      </Badge>
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={showOnlyUndoable}
                    onCheckedChange={setShowOnlyUndoable}
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Apenas ações reversíveis
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Clear all button */}
            {showClearAll && (
              <Button
                variant="outline" 
                size="sm"
                onClick={clearActivities}
                disabled={activities.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Search input */}
        {showSearch && (
          <div className="mt-4">
            <Input
              placeholder="Buscar atividades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className={cn('space-y-4', compact && 'space-y-2')}>
        {Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
          <div key={dateGroup}>
            {groupByDate && dateGroup && (
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dateGroup}
                </h4>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            )}
            
            <div className={cn('space-y-3', compact && 'space-y-2')}>
              {groupActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  compact={compact}
                  showTimestamp={showTimestamps}
                  showUndoAction={showUndoActions}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && activities.length > 0 && (
          <div className="text-center py-8">
            <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Nenhuma atividade encontrada com os filtros aplicados.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Activity Item Component
interface ActivityItemProps {
  activity: ActivityEntry;
  compact: boolean;
  showTimestamp: boolean;
  showUndoAction: boolean;
}

function ActivityItem({ activity, compact, showTimestamp, showUndoAction }: ActivityItemProps) {
  const typeConfig = typeStyles[activity.type];
  const IconComponent = typeConfig.icon;

  const handleUndo = () => {
    if (activity.onUndo) {
      activity.onUndo();
    }
  };

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50',
      typeConfig.border,
      compact && 'p-2 gap-2'
    )}>
      {/* Icon */}
      <div className={cn('flex-shrink-0 p-1.5 rounded-full', typeConfig.bg)}>
        <IconComponent className={cn('h-4 w-4', typeConfig.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              'font-medium text-gray-900 dark:text-gray-100',
              compact ? 'text-sm' : 'text-base'
            )}>
              {activity.title}
            </h4>
            {activity.description && (
              <p className={cn(
                'text-gray-600 dark:text-gray-400 mt-1',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {activity.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {showUndoAction && activity.undoable && activity.onUndo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                className="h-7 px-2 text-xs"
              >
                <Undo2 className="h-3 w-3 mr-1" />
                Desfazer
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {activity.userId && (
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Usuário: {activity.userId}
                  </DropdownMenuItem>
                )}
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <DropdownMenuItem>
                    <Tag className="h-4 w-4 mr-2" />
                    Ver detalhes
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Clock className="h-4 w-4 mr-2" />
                  {new Date(activity.timestamp).toLocaleString('pt-BR')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div className={cn(
            'flex items-center gap-4 mt-2 text-gray-500 dark:text-gray-500',
            compact ? 'text-xs' : 'text-sm'
          )}>
            <span>
              {formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true,
                locale: ptBR
              })}
            </span>
            {activity.userId && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {activity.userId}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact Activity Feed for sidebars/dropdowns
export function CompactActivityFeed({ 
  maxItems = 5,
  className 
}: { 
  maxItems?: number;
  className?: string;
}) {
  const { recentActivities } = useActivityFeed();

  if (recentActivities.length === 0) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <Clock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Nenhuma atividade recente
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2 p-4', className)}>
      {recentActivities.slice(0, maxItems).map((activity) => (
        <div key={activity.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <div className="flex-shrink-0">
            {React.createElement(typeStyles[activity.type].icon, {
              className: cn('h-4 w-4', typeStyles[activity.type].color)
            })}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true,
                locale: ptBR
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}